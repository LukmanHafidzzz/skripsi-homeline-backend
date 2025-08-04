import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
        ACL: "public-read",
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    return `https://${process.env.ENDPOINT}/${process.env.BUCKET}/${fileName}`;
};
