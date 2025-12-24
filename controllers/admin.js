import { Op } from "sequelize";
import { Users, CertificateTypes, Houses, Payments, Certificates, HouseFacilities, HousePhotos, HouseSurveys, HouseProcesses, HouseDesigns, Address, Facilities, SurveyRequests, DesignRequests, GeneralFacilityTypes, GeneralFacilities } from "../models/index.model.js";
import argon2 from "argon2";
import { uploadToS3 } from "../utils/uploadS3.js";

export const getUsers = async (req, res) => {
    try {
        const response = await Users.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const getUserById = async (req, res) => {
    try {
        const response = await Users.findOne({
            where: {
                uuid: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const createUser = async (req, res) => {
    const { level_user_id, username, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).json({
            message: "Password dan confirm password tidak cocok"
        })
    };
    const hashPassword = await argon2.hash(password);
    try {
        await Users.create({
            level_user_id: level_user_id,
            username: username,
            email: email,
            password: hashPassword,
        });
        res.status(201).json({
            message: "User berhasil dibuat",
        })
    } catch (error) {
        res.status(400).json({
            message: error.message,
        })
    }
}

export const updateUser = async (req, res) => {
    const response = await Users.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if (!response) {
        return res.status(404).json({
            message: "User tidak ditemukan"
        })
    };
    const { level_user_id, username, email, no_telp, password, confirmPassword } = req.body;
    let hashPassword;
    if (password === "" || null) {
        hashPassword = response.password
    } else {
        hashPassword = await argon2.hash(password);
    };
    if (password !== confirmPassword) {
        return res.status(400).json({
            message: "Password dan confirm password tidak cocok"
        })
    };
    try {
        await Users.update({
            level_user_id: level_user_id,
            username: username,
            email: email,
            no_telp: no_telp,
            update_at: new Date(),
            password: hashPassword,
        }, {
            where: {
                uuid: response.uuid
            }
        });
        res.status(200).json({
            message: "User Berhasil diupdate",
        })
    } catch (error) {
        res.status(400).json({
            message: error.message,
        })
    };
}

export const deleteUser = async (req, res) => {
    const response = await Users.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if (!response) {
        return res.status(404).json({
            message: "User tidak ditemukan"
        })
    };
    try {
        await Users.destroy({
            where: {
                uuid: response.uuid
            }
        });
        res.status(200).json({
            message: "User Berhasil dihapus",
        })
    } catch (error) {
        res.status(400).json({
            message: error.message,
        })
    }
}

export const getHouse = async (req, res) => {
    try {
        const houses = await Houses.findAll({
            include: [
                {
                    model: HousePhotos,
                    limit: 1,
                }
            ],
        });
        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const getHouseStatusPending = async (req, res) => {
    try {
        const houses = await Houses.findAll({
            where: {
                status: "Pending"
            }
        });
        res.status(200).json(houses);
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

export const updateHousePendingToOffering = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await Houses.findOne({
            where: { id },
        });

        if (!house) {
            return res.status(404).json({
                message: "Rumah tidak ditemukan"
            });
        }

        house.status = "Offering 3D";
        await house.save();

        res.status(200).json({
            message: "Status rumah berhasil diperbarui",
            house
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const updateHousePendingToRejected = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await Houses.findOne({
            where: { id },
        });

        if (!house) {
            return res.status(404).json({
                message: "Rumah tidak ditemukan"
            });
        }

        house.status = "Rejected";
        await house.save();

        res.status(200).json({
            message: "Status rumah berhasil diperbarui",
            house
        });
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

export const getHouseInputQr = async (req, res) => {
    try {
        const houses = await Houses.findAll({
            where: {
                status: "Waiting Payment",
                use_3d: "yes",
            },
            include: [{
                model: Payments,
                attributes: ['qr'],
            }],
        });
        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const postHouseInputQr = async (req, res) => {
    try {
        const { house_id } = req.body;
        const qr = req.files?.qr;

        if (!qr) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileName = `qr_${Date.now()}.png`;
        const fileBuffer = qr.data;
        const mimetype = qr.mimetype;

        const fileUrl = await uploadToS3(fileBuffer, fileName, mimetype);

        const newPayment = await Payments.create({
            house_id,
            qr: fileUrl,
        });

        res.status(201).json({ message: "QR uploaded successfully", data: newPayment });
    } catch (err) {
        console.error("Error uploading to S3:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getHouseStatus3dYes = async (req, res) => {
    try {
        const houses = await Houses.findAll({
            where: {
                status: "Waiting Payment",
                use_3d: "yes",
            },
            include: [
                {
                    model: Payments,
                    where: {
                        qr: {
                            [Op.ne]: null,
                        },
                    },
                    required: true,
                },
            ]
        });
        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const updateHousePaymentConfirm = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await Houses.findOne({
            where: { id },
        });

        if (!house) {
            return res.status(404).json({
                message: "Rumah tidak ditemukan"
            });
        }

        house.status = "Processing";
        await house.save();

        await HouseProcesses.create({
            house_id: house.id,
            survey_process: "Perlu Survey"
        });

        res.status(200).json({
            message: "Status rumah berhasil diperbarui",
            house
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message
        });
    }
};

export const getHouseGeoCoordinate = async (req, res) => {
    try {
        const houses = await Houses.findAll({
            where: {
                status: "Processing",
                latitude: null,
                longitude: null,
            },
        });
        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const postGeoCoordinate = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await Houses.findOne({ where: { id } });
        if (!house) {
            return res.status(404).json({ message: "Rumah tidak ditemukan" });
        }

        const latitude = req.body.latitude;
        if (!latitude) {
            return res.status(400).json({ message: "Latitude tidak boleh kosong" });
        }
        house.latitude = latitude;

        const longitude = req.body.longitude;
        if (!longitude) {
            return res.status(400).json({ message: "Longitude tidak boleh kosong" });
        }
        house.longitude = longitude;

        await house.save();

        res.status(200).json({ message: "Berhasil melakukan input" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getHouseSurveyReq = async (req, res) => {
    try {
        const survey_requests = await SurveyRequests.findAll({
            include: [
                {
                    model: Houses,
                },
                {
                    model: HouseProcesses,
                },
            ],
        })
        res.status(200).json(survey_requests);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const getHouseDesignReq = async (req, res) => {
    try {
        const design_requests = await DesignRequests.findAll({
            include: [
                {
                    model: Houses,
                },
                {
                    model: HouseProcesses,
                },
            ],
        })
        res.status(200).json(design_requests);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const rejectRequestSurvey = async (req, res) => {
    try {
        const { id } = req.params;

        const surveyRequest = await SurveyRequests.findOne({
            where: {
                house_id: id
            },
        });

        if (!surveyRequest) {
            return res.status(404).json({
                message: "Survey request tidak ditemukan untuk rumah ini"
            });
        }

        surveyRequest.request_status = "Rejected";
        await surveyRequest.save();

        res.status(200).json({
            message: "Status survey request berhasil diperbarui",
            surveyRequest
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const approveRequestSurvey = async (req, res) => {
    try {
        const { id } = req.params;

        const surveyRequest = await SurveyRequests.findOne({
            where: {
                house_id: id
            },
        });

        if (!surveyRequest) {
            return res.status(404).json({
                message: "Survey request tidak ditemukan untuk rumah ini"
            });
        }

        surveyRequest.request_status = "Approved";
        await surveyRequest.save();

        const houseProcess = await HouseProcesses.findOne({
            where: { house_id: id }
        });

        if (!houseProcess) {
            return res.status(404).json({
                message: "House process tidak ditemukan untuk rumah ini"
            });
        }

        houseProcess.survey_process = "Sedang Survey";
        await houseProcess.save();

        res.status(200).json({
            message: "Status berhasil diperbarui",
            surveyRequest,
            houseProcess
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const rejectRequestDesign = async (req, res) => {
    try {
        const { id } = req.params;

        const designRequest = await DesignRequests.findOne({
            where: {
                house_id: id
            },
        });

        if (!designRequest) {
            return res.status(404).json({
                message: "Design request tidak ditemukan untuk rumah ini"
            });
        }

        designRequest.request_status = "Rejected";
        await designRequest.save();

        res.status(200).json({
            message: "Status design request berhasil diperbarui",
            designRequest
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const approveRequestDesign = async (req, res) => {
    try {
        const { id } = req.params;

        const designRequest = await DesignRequests.findOne({
            where: {
                house_id: id
            },
        });

        if (!designRequest) {
            return res.status(404).json({
                message: "Design tidak ditemukan untuk rumah ini"
            });
        }

        designRequest.request_status = "Approved";
        await designRequest.save();

        res.status(200).json({
            message: "Status design request berhasil diperbarui",
            designRequest
        });

        const houseProcess = await HouseProcesses.findOne({
            where: { house_id: id }
        });

        if (!houseProcess) {
            return res.status(404).json({
                message: "House process tidak ditemukan untuk rumah ini"
            });
        }

        houseProcess.design_process = "Sedang Desain";
        await houseProcess.save();

        res.status(200).json({
            message: "Status berhasil diperbarui",
            designRequest,
            houseProcess
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getSurveyListHouse = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                survey_process: {
                    [Op.not]: null,
                }
            },
            include: {
                model: Houses,
            }
        })
        res.status(200).json(house_processes);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const getSurveyHasilInput = async (req, res) => {
    try {
        const houses = await Houses.findAll({
            include: [
                {
                    model: HouseProcesses,
                    where: {
                        survey_process: "Pengecekan Hasil"
                    }
                },
            ]
        });
        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const approveInputHasilSurvey = async (req, res) => {
    try {
        const { id } = req.params;

        const inputHasilSurvey = await HouseProcesses.findOne({
            where: {
                house_id: id
            },
        });

        if (!inputHasilSurvey) {
            return res.status(404).json({
                message: "Survey tidak ditemukan untuk rumah ini"
            });
        }

        const house = await Houses.findOne({
            where: {
                id: id
            }
        });

        if (!house) {
            return res.status(404).json({
                message: "Rumah tidak ditemukan"
            });
        }

        inputHasilSurvey.survey_process = "Survey Selesai";

        if (house.use_3d === "yes") {
            inputHasilSurvey.design_process = "Perlu Desain";
        } else {
            house.status = "Approved";
            await house.save();
        }

        await inputHasilSurvey.save();

        res.status(200).json({
            message: "Status berhasil diperbarui",
            inputHasilSurvey,
            house
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


export const getDesignListHouse = async (req, res) => {
    try {
        const house_processes = await HouseProcesses.findAll({
            where: {
                design_process: {
                    [Op.not]: null,
                }
            },
            include: {
                model: Houses,
            }
        })
        res.status(200).json(house_processes);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const getDesignHasilInput = async (req, res) => {
    try {
        const houses = await Houses.findAll({
            include: [
                {
                    model: HouseProcesses,
                    where: {
                        design_process: "Pengecekan Hasil"
                    }
                },
            ]
        });
        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const approveInputHasilDesign = async (req, res) => {
    try {
        const { id } = req.params;

        const inputHasilDesign = await HouseProcesses.findOne({
            where: {
                house_id: id
            },
        });

        if (!inputHasilDesign) {
            return res.status(404).json({
                message: "Desain tidak ditemukan untuk rumah ini"
            });
        }

        const house = await Houses.findOne({
            where: {
                id: id
            }
        });

        if (!house) {
            return res.status(404).json({
                message: "Rumah tidak ditemukan"
            });
        }

        inputHasilDesign.design_process = "Desain Selesai";
        await inputHasilDesign.save();

        house.status = "Approved";
        await house.save();

        res.status(200).json({
            message: "Status berhasil diperbarui",
            inputHasilDesign,
            house
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};