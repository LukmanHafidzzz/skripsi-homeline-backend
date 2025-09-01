import { Op } from "sequelize";
import { Users, CertificateTypes, Houses, Certificates, HouseFacilities, HousePhotos, HouseSurveys, HouseProcesses, HouseDesigns, Address, Facilities, SurveyRequests, DesignRequests, GeneralFacilities, GeneralFacilityTypes } from "../models/index.model.js";

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

export const getListHouseMakeReq = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                survey_process: "Perlu Survey"
            },
            include: [
                {
                    model: Houses,
                    include: {
                        model: Address,
                    },
                },
                {
                    model: SurveyRequests,
                    required: false
                }
            ]
        });

        const filtered = house_processes.filter(hp => hp.survey_request === null);

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

        const newRequest = await SurveyRequests.create({
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
                survey_process: "Sedang Survey"
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
                survey_process: "Pengecekan Hasil"
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