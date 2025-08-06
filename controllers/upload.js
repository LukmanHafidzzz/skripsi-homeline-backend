export const handleUpload = async (req, res) => {
    try {
        const file = req.files?.file;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const buffer = file.data;
        const fileName = file.name;
        const contentType = file.mimetype;

        const url = await uploadToS3(buffer, fileName, contentType);
        res.status(200).json({ url });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
};
