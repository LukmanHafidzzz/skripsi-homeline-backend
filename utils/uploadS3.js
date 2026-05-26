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
});

export const uploadToS3 = async (fileBuffer, fileName, mimetype) => {
    const params = {
        Bucket: process.env.BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype,
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
    };

    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn });

    return {
        presignedUrl,
        fileUrl: `https://${process.env.ENDPOINT}/${process.env.BUCKET}/${fileName}`
    };
};