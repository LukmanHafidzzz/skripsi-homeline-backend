// controllers/upload.controller.js
import { generatePresignedUrl, uploadToS3 } from "../utils/uploadS3.js";
import Tests from "../models/test.model.js";

export const getAllTests = async (req, res) => {
    try {
        const data = await Tests.findAll({ order: [["created_at", "DESC"]] });
        return res.status(200).json({ message: "Berhasil", data });
    } catch (error) {
        console.error("getAllTests error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getPresignedUrl = async (req, res) => {
    try {
        const { fileName, contentType } = req.body;

        if (!fileName || !contentType) {
            return res.status(400).json({ message: "fileName dan contentType wajib diisi" });
        }

        const result = await generatePresignedUrl(fileName, contentType);

        return res.status(200).json({
            message: "Presigned URL berhasil dibuat",
            presignedUrl: result.presignedUrl,
            fileUrl: result.fileUrl,
        });
    } catch (error) {
        console.error("getPresignedUrl error:", error);
        return res.status(500).json({ message: "Gagal generate presigned URL" });
    }
};

export const createTest = async (req, res) => {
    try {
        const { file } = req.body;
        if (!file) {
            return res.status(400).json({ message: "Field 'file' (URL) wajib diisi" });
        }

        const data = await Tests.create({ file });
        return res.status(201).json({ message: "Berhasil disimpan", data });
    } catch (error) {
        console.error("createTest error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};