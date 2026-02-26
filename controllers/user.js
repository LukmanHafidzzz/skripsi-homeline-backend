import { Op, Sequelize } from "sequelize";
import { Users, CertificateTypes, Houses, Payments, Certificates, HouseFacilities, HousePhotos, HouseSurveys, HouseProcesses, HouseDesigns, Address, Facilities, GeneralFacilities, GeneralFacilityTypes } from "../models/index.model.js";
import argon2 from "argon2";
import { generatePresignedUrl, uploadToS3 } from "../utils/uploadS3.js";
import sharp from "sharp";
import db from "../config/database.js";
import { generateHouseCode } from "../helpers/generate.house.code.js";

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

export const getCertificateTypes = async (req, res) => {
    try {
        const response = await CertificateTypes.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getHouse = async (req, res) => {
    try {
        const response = await Houses.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}

export const getFacilitiy = async (req, res) => {
    try {
        const response = await Facilities.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}

export const getHouseByUserIdPending = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login ke akun anda"
            });
        }

        const users = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!users) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const houses = await Houses.findAll({
            where: {
                user_id: users.id,
                status: 'Pending',
            }
        });

        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHouseByUserIdWaitingPayment = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login ke akun anda"
            });
        }

        const users = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!users) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const houses = await Houses.findAll({
            where: {
                user_id: users.id,
                status: 'Waiting Payment',
            },
            include: [{
                model: Payments,
                attributes: ['qr'],
                required: false
            }]
        });

        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHouseByUserIdProcessing = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login ke akun anda"
            });
        }

        const users = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!users) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const houses = await Houses.findAll({
            where: {
                user_id: users.id,
                status: 'Processing',
            },
            include: [
                {
                    model: HouseProcesses
                },
            ]
        });

        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHouseByUserIdApproved = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login ke akun anda"
            });
        }

        const users = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!users) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const houses = await Houses.findAll({
            where: {
                user_id: users.id,
                status: 'Approved',
            }
        });

        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHouseByUserIdRejected = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login ke akun anda"
            });
        }

        const users = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!users) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const houses = await Houses.findAll({
            where: {
                user_id: users.id,
                status: 'Rejected',
            }
        });

        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHouseByUserDelete = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login ke akun anda"
            });
        }

        const users = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!users) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const houses = await Houses.findAll({
            where: {
                user_id: users.id,
                status: {
                    [Op.in]: ['Approved', 'Rejected']
                }
            }
        });

        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteHouseByUser = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login ke akun anda"
            });
        }

        const user = await Users.findOne({ where: { uuid: req.session.userId } });
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const house = await Houses.findOne({
            where: {
                id: req.params.id,
                user_id: user.id,
                status: {
                    [Op.in]: ['Approved', 'Rejected']
                }
            }
        });

        if (!house) {
            return res.status(404).json({ message: "Iklan tidak ditemukan atau tidak dapat dihapus." });
        }

        await house.destroy();

        res.status(200).json({ message: "Iklan berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getHouseAdvertisementDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await Houses.findOne({
            where: { id },
            include: [
                {
                    model: Users,
                    attributes: ['id', 'username', 'email']
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

export const getHouseModelAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await Houses.findOne({
            where: { id },
            include: [
                {
                    model: Users,
                    attributes: ['id', 'username', 'email']
                },
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
}

export const getPresignedUrlForHouseFile = async (req, res) => {
    try {
        const { fileName, contentType, folder } = req.body;

        if (!fileName || !contentType || !folder) {
            return res.status(400).json({
                message: "fileName, contentType, dan folder diperlukan"
            });
        }

        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login terlebih dahulu"
            });
        }

        const uniqueFileName =
            `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${fileName}`;

        const { presignedUrl, fileUrl } =
            await generatePresignedUrl(uniqueFileName, contentType, 3600);

        return res.status(200).json({
            presignedUrl,
            fileUrl,
            fileName: uniqueFileName
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal generate presigned URL"
        });
    }
};

export const addHouse = async (req, res) => {

    try {
        const user = await Users.findOne({
            where: { uuid: req.session.userId },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const {
            title,
            building_area,
            land_area,
            price,
            no_telp,
            description,
            link_maps,
            province,
            city,
            subdistrict,
            village,
            full_address,
            certificate_type_id,
            facilities: facilitiesString,
            use_3d,
        } = req.body;

        if (!title || !building_area || !land_area || !price || !no_telp || !description ||
            !link_maps || !province || !city || !subdistrict || !village ||
            !full_address || !certificate_type_id || !use_3d) {

            return res.status(400).json({ message: 'Missing required fields' });
        }

        const use3DValue = use_3d === 'yes' ? 'yes' : 'no';

        let facilities = [];

        if (facilitiesString) {
            try {
                facilities = JSON.parse(facilitiesString);
                if (!Array.isArray(facilities)) facilities = [];
            } catch {
                facilities = [];
            }
        }

        let uploadedPhotos = [];
        let uploadedCertificate = null;

        const {
            photos,
            certificate_url,
        } = req.body;

        const t = await db.transaction();

        try {

            const houseCode = await generateHouseCode(city, t);

            const house = await Houses.create({
                house_code: houseCode,
                user_id: user.id,
                title,
                building_area: parseInt(building_area),
                land_area: parseInt(land_area),
                price: parseFloat(price),
                no_telp,
                description,
                link_maps,
                use_3d: use3DValue,
            }, { transaction: t });

            await Address.create({
                house_id: house.id,
                province,
                city,
                subdistrict,
                village,
                full_address
            }, { transaction: t });

            if (photos && photos.length > 0) {
                const photoPayload = photos.map(photo => ({
                    house_id: house.id,
                    photo
                }));
                await HousePhotos.bulkCreate(photoPayload, { transaction: t });
            }


            if (certificate_url) {
                await Certificates.create({
                    house_id: house.id,
                    certificate_file: certificate_url,
                    certificate_type_id: parseInt(certificate_type_id)
                }, { transaction: t });
            }

            if (facilities.length > 0) {

                const facilityPayload = facilities
                    .filter(f => f.facility_id && f.quantity > 0)
                    .map(f => ({
                        house_id: house.id,
                        facility_id: parseInt(f.facility_id),
                        quantity: parseInt(f.quantity)
                    }));

                if (facilityPayload.length > 0) {
                    await HouseFacilities.bulkCreate(facilityPayload, { transaction: t });
                }
            }

            await t.commit();

            return res.status(201).json({
                message: 'House successfully created',
                house_id: house.id,
                house_code: houseCode
            });

        } catch (err) {

            await t.rollback();
            throw err;

        }

    } catch (err) {

        console.error('Full error:', err);

        return res.status(500).json({
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development'
                ? err.message
                : undefined
        });
    }
};

export const getSearchHouse = async (req, res) => {
    try {
        const house = await Houses.findAll({
            include: [
                {
                    model: HousePhotos,
                    limit: 1,
                },
                {
                    model: Address,
                },
                {
                    model: HouseFacilities,
                },
            ],
            where: {
                status: 'Approved',
            },
        });
        res.status(200).json(house);
    } catch (error) {
        console.error("Search house error:", error);
        res.status(500).json({
            message: error.message,
        });
    }
}

export const getSearchHouseDetail = async (req, res) => {
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

export const getSearchHouseModel = async (req, res) => {
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

export const getProvinces = async (req, res) => {
    try {
        const response = await Address.findAll({
            attributes: ['province'],
            include: [
                {
                    model: Houses,
                    where: { status: 'Approved' },
                    attributes: [],
                }
            ],
            group: ['province'],
        });

        const provinces = response.map(item => item.province);
        res.status(200).json(provinces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getCountHouseByUserId = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Mohon login ke akun anda"
            });
        }

        const users = await Users.findOne({
            where: { uuid: req.session.userId }
        });

        if (!users) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const statuses = ['approved', 'rejected', 'pending', 'waiting_payment', 'processing'];

        const counts = await Promise.all(
            statuses.map(status =>
                Houses.count({
                    where: { user_id: users.id, status }
                })
            )
        );

        const total = counts.reduce((sum, val) => sum + val, 0);

        res.status(200).json({
            total,
            approved: counts[0],
            rejected: counts[1],
            pending: counts[2],
            waiting_payment: counts[3],
            processing: counts[4],
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};