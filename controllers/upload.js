export const handleUpload = async (req, res) => {
    try {
        const chunks = [];
        req.on("data", chunk => chunks.push(chunk));
        req.on("end", async () => {
            const buffer = Buffer.concat(chunks);
            const fileName = req.headers["x-filename"];
            const contentType = req.headers["content-type"];

            if (!fileName || !contentType) {
                return res.status(400).json({ error: "Missing filename or content-type" });
            }

            const url = await uploadToS3(buffer, fileName, contentType);
            res.status(200).json({ url });
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
};