import { Op, where } from "sequelize";
import { Users, CertificateTypes, Houses, Certificates, HouseFacilities, HousePhotos, HouseSurveys, HouseProcesses, HouseDesigns, Address, Facilities, HouseDesignRevs, HouseSurveyRevs, GeneralFacilities, GeneralFacilityTypes } from "../models/index.model.js";

import { uploadToS3 } from "../utils/uploadS3.js";

export const getListHouse = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                survey_process: {
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
                    model: HouseSurveys,
                    required: false,
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

export const getListHouseNeedSurvey = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                survey_process: "Perlu Survey"
            },
            include: {
                model: Houses,
                include: {
                    model: Address,
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

export const startSurvey = async (req, res) => {
    try {
        const { id } = req.params;

        const pendingSurvey = await HouseProcesses.findOne({
            where: {
                survey_process: "Sedang Survey",
                survey_status_input: null
            }
        });

        if (pendingSurvey) {
            return res.status(400).json({
                message: "Selesaikan input survey sebelumnya terlebih dahulu."
            });
        }

        const houseProcess = await HouseProcesses.findByPk(id);

        if (!houseProcess) {
            return res.status(404).json({
                message: "Data house process tidak ditemukan",
            });
        }

        if (houseProcess.survey_process !== "Perlu Survey") {
            return res.status(400).json({
                message: "Survey sudah diklaim atau sedang diproses",
            });
        }

        await houseProcess.update({
            survey_process: "Sedang Survey",
        });

        res.status(200).json({
            message: "Survey berhasil diklaim",
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getListHouseInput = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                survey_process: {
                    [Op.or]: [
                        "Sedang Survey",
                        "Survey Selesai",
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
                        model: HouseSurveys,
                        required: false,
                    }
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

export const getGeneralFacilityTypes = async (req, res) => {
    try {
        const response = await GeneralFacilityTypes.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const postInputHouseSurvey = async (req, res) => {
    try {
        const { house_id, photo_video_link } = req.body;
        const surveyFile = req.files?.notes_file;

        if (!surveyFile) {
            return res.status(400).json({ message: "File tidak ditemukan" });
        }

        if (!photo_video_link) {
            return res.status(400).json({ message: "Link dokumentasi harus diisi" });
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

        const fileName = `surveys/survey_${Date.now()}_${surveyFile.name}`;
        const fileUrl = await uploadToS3(surveyFile.data, fileName, surveyFile.mimetype);

        await HouseSurveys.create({
            house_id: house_id,
            user_id: user.id,
            photo_video_link: photo_video_link,
            notes_file: fileUrl,
        });

        if (req.body.general_facilities) {
            let generalFacilities = [];
            try {
                generalFacilities = JSON.parse(req.body.general_facilities);
            } catch (err) {
                console.error("Error parsing generalFacilities:", err);
                return res.status(400).json({ message: "Format fasilitas umum tidak valid" });
            }

            if (Array.isArray(generalFacilities)) {
                for (const f of generalFacilities) {
                    if (f.type_id && f.name && f.latitude && f.longitude && f.maps) {
                        await GeneralFacilities.create({
                            house_id: house_id,
                            type_id: f.type_id,
                            name: f.name,
                            latitude: f.latitude,
                            longitude: f.longitude,
                            maps: f.maps,
                        });
                    }
                }
            }
        }

        await HouseProcesses.update(
            {
                survey_status_input: "Pengecekan Hasil"
            },
            {
                where: {
                    house_id: house_id
                }
            }
        );

        return res.status(201).json({ message: "File catatan survei berhasil diinput!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
};

export const getSurveyNeedRevListHouse = async (req, res) => {
    try {
        const houses = await Houses.findAll({
            include: [
                {
                    model: HouseProcesses,
                    where: {
                        survey_status_input: "Revisi",
                    },
                    include: [
                        {
                            model: HouseSurveyRevs,
                            limit: 1,
                            order: [['created_at', 'DESC']]
                        }
                    ]
                }
            ]
        });
        const filteredHouses = houses.filter(house =>
            house.house_process?.house_survey_revs?.length > 0
        );

        res.status(200).json(filteredHouses);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const revHouseSurvey = async (req, res) => {
    try {
        const { house_id, photo_video_link } = req.body;
        const surveyFile = req.files?.notes_file;

        if (!photo_video_link) {
            return res.status(400).json({ message: "Link dokumentasi harus diisi" });
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

        const existingSurvey = await HouseSurveys.findOne({
            where: { house_id }
        });

        if (!existingSurvey) {
            return res.status(404).json({ message: "Data survey tidak ditemukan" });
        }

        let fileUrl = existingSurvey.notes_file;

        if (surveyFile) {
            const fileName = `surveys/survey_${Date.now()}_${surveyFile.name}`;
            fileUrl = await uploadToS3(
                surveyFile.data,
                fileName,
                surveyFile.mimetype
            );
        }

        await existingSurvey.update({
            photo_video_link,
            notes_file: fileUrl,
        });

        if (req.body.general_facilities) {

            let generalFacilities = [];

            try {
                generalFacilities = JSON.parse(req.body.general_facilities);
            } catch (err) {
                return res.status(400).json({
                    message: "Format fasilitas umum tidak valid"
                });
            }

            if (Array.isArray(generalFacilities)) {
                for (const f of generalFacilities) {
                    if (f.type_id && f.name && f.latitude && f.longitude && f.maps) {
                        await GeneralFacilities.create({
                            house_id,
                            type_id: f.type_id,
                            name: f.name,
                            latitude: f.latitude,
                            longitude: f.longitude,
                            maps: f.maps,
                        });
                    }
                }
            }
        }

        await HouseProcesses.update(
            {
                survey_status_input: "Pengecekan Hasil"
            },
            {
                where: { house_id }
            }
        );

        return res.status(200).json({
            message: "Revisi survey berhasil disimpan"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Terjadi kesalahan saat revisi survey"
        });
    }
};