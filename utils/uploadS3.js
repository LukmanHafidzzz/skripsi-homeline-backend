// utils/s3.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
    },
    endpoint: `https://${process.env.ENDPOINT}`,

    // ✅ FIX: AWS SDK v3 secara default menambahkan checksum CRC32 ke setiap request.
    // Ini menyebabkan x-amz-checksum-crc32 masuk ke SignedHeaders di presigned URL,
    // tapi XHR dari browser tidak mengirim header itu → signature mismatch → 403.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});

export const uploadToS3 = async (fileBuffer, fileName, mimetype) => {
    const params = {
        Bucket: process.env.BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype,
        ACL: "public-read",
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return `https://${process.env.ENDPOINT}/${process.env.BUCKET}/${fileName}`;
};

export const generatePresignedUrl = async (fileName, contentType, expiresIn = 3600) => {
    const params = {
        Bucket: process.env.BUCKET,
        Key: fileName,
        ContentType: contentType,

        // ✅ FIX: ACL dihapus dari presigned URL params.
        // Kalau ACL: "public-read" ada di sini, maka "x-amz-acl" masuk ke SignedHeaders.
        // Browser XHR tidak bisa set header x-amz-acl karena itu "forbidden header" di CORS S3.
        // Akibatnya signature mismatch → 403.
        // Solusi: atur akses public di bucket policy/ACL di console provider S3 kamu.
        // ACL: "public-read",  ← DIHAPUS
    };

    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn });

    return {
        presignedUrl,
        fileUrl: `https://${process.env.ENDPOINT}/${process.env.BUCKET}/${fileName}`,
    };
};