import { Op } from "sequelize";
import { Users, CertificateTypes, Houses, Certificates, HouseFacilities, HousePhotos, HouseSurveys, HouseProcesses, HouseDesigns, Address, Facilities, HouseDesignRevs, HouseSurveyRevs, GeneralFacilities, GeneralFacilityTypes } from "../models/index.model.js";
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
                    model: HouseProcesses,
                    include: [
                        {
                            model: HouseSurveyRevs,
                        },
                        {
                            model: HouseDesignRevs,
                        },
                    ],
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

export const getListHouseNeedDesign = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                design_process: "Perlu Desain"
            },
            include: {
                model: Houses,
                include: {
                    model: HouseSurveys,
                }
            },
            order: [
                ["created_at", "ASC"]
            ]
        })
        res.status(200).json(house_processes);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const startDesign = async (req, res) => {
    try {
        const { id } = req.params;

        const pendingDesign = await HouseProcesses.findOne({
            where: {
                design_process: "Sedang Desain",
                design_status_input: null
            }
        });

        if (pendingDesign) {
            return res.status(400).json({
                message: "Selesaikan input desain sebelumnya terlebih dahulu."
            });
        }

        const houseProcess = await HouseProcesses.findByPk(id);

        if (!houseProcess) {
            return res.status(404).json({
                message: "Data house process tidak ditemukan",
            });
        }

        if (houseProcess.design_process !== "Perlu Desain") {
            return res.status(400).json({
                message: "Desain sudah diklaim atau sedang diproses",
            });
        }

        await houseProcess.update({
            design_process: "Sedang Desain",
        });

        res.status(200).json({
            message: "Desain berhasil diklaim",
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
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

export const getListHouseInput = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                design_process: {
                    [Op.or]: [
                        "Sedang Desain",
                        "Pengecekan Hasil",
                        "Desain Selesai",
                    ]
                }
            },
            include: {
                model: Houses,
                include: [
                    {
                        model: Address,
                    },
                    {
                        model: HouseDesigns,
                        required: false,
                    },
                ]
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
                design_status_input: "Pengecekan Hasil"
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
        const { fileName, contentType } = req.body;
        if (!fileName || !contentType) {
            console.log('Missing required fields - fileName:', !!fileName, 'contentType:', !!contentType);
            return res.status(400).json({
                message: "fileName dan contentType diperlukan",
                received: { fileName, contentType }
            });
        };

        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login terlebih dahulu"
            });
        };

        const user = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        };

        const extension = fileName.split('.').pop();
        const randomString = Math.random().toString(36).substring(2, 10);
        const uniqueFileName = `models/design_${Date.now()}-${randomString}.${extension}`;
        const { presignedUrl, fileUrl } = await generatePresignedUrl(
            uniqueFileName,
            contentType,
            3600
        );

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
                design_status_input: "Pengecekan Hasil"
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

export const getDesignNeedRevListHouse = async (req, res) => {
    try {
        const houses = await Houses.findAll({
            include: [
                {
                    model: HouseProcesses,
                    where: {
                        design_status_input: "Revisi",
                    },
                    include: [
                        {
                            model: HouseDesignRevs,
                            limit: 1,
                            order: [['created_at', 'DESC']]
                        }
                    ]
                }
            ]
        });
        const filteredHouses = houses.filter(house =>
            house.house_process?.house_design_revs?.length > 0
        );

        res.status(200).json(filteredHouses);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const revHouseDesign = async (req, res) => {
    try {

        const { house_id, fileUrl, fileName } = req.body;

        if (!house_id) {
            return res.status(400).json({
                message: "house_id diperlukan"
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

        const existingDesign = await HouseDesigns.findOne({
            where: { house_id }
        });

        if (!existingDesign) {
            return res.status(404).json({
                message: "Data desain tidak ditemukan"
            });
        }

        let floorPlanUrl = existingDesign.floor_plan;
        let designFileUrl = existingDesign.design_file;

        if (req.files?.floor_plan) {

            const floorPlanFile = req.files.floor_plan;

            const newFloorPlanName =
                `floorPlanPhotos/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;

            floorPlanUrl = await uploadToS3(
                floorPlanFile.data,
                newFloorPlanName,
                floorPlanFile.mimetype
            );
        }

        if (fileUrl && fileName) {
            designFileUrl = fileUrl;
        }

        await existingDesign.update({
            design_file: designFileUrl,
            floor_plan: floorPlanUrl
        });

        await HouseProcesses.update(
            {
                design_status_input: "Pengecekan Hasil"
            },
            {
                where: { house_id }
            }
        );

        return res.status(200).json({
            message: "Revisi desain berhasil disimpan"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Terjadi kesalahan saat revisi desain"
        });
    }
};

export const CountDesignHouse = async (req, res) => {
    try {
        const designProcessStatuses = ['Perlu Desain', 'Sedang Desain', 'Desain Selesai'];
        const designStatusInputStatuses = ['Approved', 'Pengecekan Hasil', 'Revisi'];

        const [designProcessCounts, designStatusInputCounts] = await Promise.all([
            Promise.all(
                designProcessStatuses.map(status =>
                    HouseProcesses.count({ where: { design_process: status } })
                )
            ),
            Promise.all(
                designStatusInputStatuses.map(status =>
                    HouseProcesses.count({ where: { design_status_input: status } })
                )
            )
        ]);

        res.status(200).json({
            design_process: {
                perlu_desain: designProcessCounts[0],
                sedang_desain: designProcessCounts[1],
                desain_selesai: designProcessCounts[2],
            },
            design_status_input: {
                approved: designStatusInputCounts[0],
                pengecekan_hasil: designStatusInputCounts[1],
                revisi: designStatusInputCounts[2],
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}