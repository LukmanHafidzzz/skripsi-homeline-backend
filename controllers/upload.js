import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
    },
    endpoint: `https://${process.env.ENDPOINT}`
});

export const getPresignedUrl = async (req, res) => {
    try {
        const { filename, filetype } = req.query;

        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET,
            Key: filename,
            ContentType: filetype,
            ACL: "public-read"
        });

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

        const publicUrl = `https://${process.env.ENDPOINT}/${process.env.BUCKET}/${filename}`;

        res.status(200).json({ signedUrl, publicUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal generate pre-signed URL" });
    }
};
