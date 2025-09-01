import { Op } from "sequelize";
import { Users, CertificateTypes, Houses, Certificates, HouseFacilities, HousePhotos, HouseSurveys, HouseProcesses, HouseDesigns, Address, Facilities, SurveyRequests, DesignRequests, GeneralFacilities, GeneralFacilityTypes } from "../models/index.model.js";
import { generatePresignedUrl, uploadToS3 } from "../utils/uploadS3.js";

export const getListHouse = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                design_process: {
                    [Op.not]: null,
                }
            },
            include: {
                model: Houses,
                include: {
                    model: Address,
                }
            }
        })
        res.status(200).json(house_processes);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const getHouseDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await Houses.findOne({
            where: { id },
            include: [
                {
                    model: Users,
                },
                {
                    model: Address
                },
                {
                    model: Certificates,
                    include: [
                        {
                            model: CertificateTypes
                        }
                    ]
                },
                {
                    model: HouseFacilities,
                    include: [
                        {
                            model: Facilities
                        }
                    ]
                },
                {
                    model: HousePhotos
                },
                {
                    model: HouseSurveys
                },
                {
                    model: HouseDesigns
                },
                {
                    model: HouseProcesses
                },
                {
                    model: SurveyRequests,
                    include: [
                        {
                            model: Users,
                            attributes: ['username', 'email']
                        }
                    ]
                },
                {
                    model: DesignRequests,
                    include: [
                        {
                            model: Users,
                            attributes: ['username', 'email']
                        }
                    ]
                },
                {
                    model: GeneralFacilities,
                    include: [
                        { model: GeneralFacilityTypes }
                    ]
                }
            ]
        });

        if (!house) {
            return res.status(404).json({
                message: "Rumah tidak ditemukan"
            });
        }

        res.status(200).json(house);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getHouse3DModel = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await Houses.findOne({
            where: { id },
            include: [
                {
                    model: HouseDesigns
                },
            ]
        });

        if (!house) {
            return res.status(404).json({
                message: "Rumah tidak ditemukan"
            });
        }

        res.status(200).json(house);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getListHouseMakeReq = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                design_process: "Perlu Desain"
            },
            include: [
                {
                    model: Houses,
                    include: {
                        model: Address,
                    },
                },
                {
                    model: DesignRequests,
                    required: false
                }
            ]
        });

        const filtered = house_processes.filter(hp => hp.design_request === null);

        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const postMakeRequest = async (req, res) => {
    try {
        const { house_id } = req.body;

        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login terlebih dahulu"
            });
        }

        const user = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const newRequest = await DesignRequests.create({
            house_id,
            user_id: user.id
        });

        res.status(201).json({
            message: "Request berhasil dibuat",
            data: newRequest,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getListHouseInput = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                design_process: "Sedang Desain"
            },
            include: {
                model: Houses,
                include: {
                    model: Address,
                }
            }
        })
        res.status(200).json(house_processes);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const postInputHouseModel = async (req, res) => {
    try {
        const { house_id } = req.body;
        const designFile = req.files?.design_file;

        if (!designFile) {
            return res.status(400).json({ message: "File tidak ditemukan" });
        }

        if (!req.session.userId) {
            return res.status(401).json({ message: "Mohon login terlebih dahulu" });
        }

        const user = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const fileName = `design_${Date.now()}_${designFile.name}`;
        const fileBuffer = designFile.data;
        const mimetype = designFile.mimetype;
        const fileUrl = await uploadToS3(fileBuffer, fileName, mimetype);

        await HouseDesigns.create({
            house_id: house_id,
            user_id: user.id,
            design_file: fileUrl
        });

        await HouseProcesses.update(
            {
                design_process: "Pengecekan Hasil"
            },
            {
                where: {
                    house_id: house_id
                }
            }
        );

        return res.status(201).json({ message: "File berhasil diinput!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
}

export const getPresignedUrlForDesign = async (req, res) => {
    try {
        // Debug logging
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers);

        const { fileName, contentType } = req.body;

        console.log('Extracted fileName:', fileName);
        console.log('Extracted contentType:', contentType);

        if (!fileName || !contentType) {
            console.log('Missing required fields - fileName:', !!fileName, 'contentType:', !!contentType);
            return res.status(400).json({
                message: "fileName dan contentType diperlukan",
                received: { fileName, contentType }
            });
        }

        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login terlebih dahulu"
            });
        }

        const user = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const uniqueFileName = `design_${Date.now()}_${fileName}`;
        console.log('Generated unique filename:', uniqueFileName);

        const { presignedUrl, fileUrl } = await generatePresignedUrl(
            uniqueFileName,
            contentType,
            3600
        );

        console.log('Generated URLs:', { presignedUrl, fileUrl });

        return res.status(200).json({
            presignedUrl,
            fileUrl,
            fileName: uniqueFileName
        });

    } catch (error) {
        console.error('Error in getPresignedUrlForDesign:', error);
        res.status(500).json({
            message: "Terjadi kesalahan saat membuat presigned URL",
            error: error.message
        });
    }
};

export const saveDesignFileInfo = async (req, res) => {
    try {
        const { house_id, fileUrl, fileName } = req.body;

        if (!house_id || !fileUrl || !fileName) {
            return res.status(400).json({
                message: "house_id, fileUrl, dan fileName diperlukan"
            });
        }

        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login terlebih dahulu"
            });
        }

        const user = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        let floorPlanUrl = null;

        if (req.files && req.files.floor_plan) {
            const floorPlanFile = req.files.floor_plan;
            const fileName = `floorPlanPhotos/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
            floorPlanUrl = await uploadToS3(
                floorPlanFile.data,
                fileName,
                floorPlanFile.mimetype
            );
        }

        await HouseDesigns.create({
            house_id: house_id,
            user_id: user.id,
            design_file: fileUrl,
            floor_plan: floorPlanUrl,
        });

        await HouseProcesses.update(
            {
                design_process: "Pengecekan Hasil"
            },
            {
                where: {
                    house_id: house_id
                }
            }
        );

        return res.status(201).json({
            message: "File desain berhasil disimpan!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Terjadi kesalahan saat menyimpan info file"
        });
    }
};