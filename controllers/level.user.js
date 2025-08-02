import { LevelUsers } from "../models/index.model.js";

export const getLevelUsers = async(req, res) => {
    try {
        const response = await LevelUsers.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const getLevelUserById = async(req, res) => {
    try {
        const response = await LevelUsers.findOne({
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

export const createLevelUser = async(req, res) => {
    const { level_name } = req.body;
    try {
        await LevelUsers.create({
            level_name: level_name,
        });
        res.status(201).json({
            message: "Data berhasil ditambahkan",
        })
    } catch (error) {
        res.status(400).json({
            message: error.message,
        })
    }
}

export const updateLevelUser = async(req, res) => {
    const response = await LevelUsers.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!response) {
        return res.status(404).json({
            message: "Data tidak ditemukan"
        })
    };
    const { level_name } = req.body;
    try {
        await LevelUsers.update({
            level_name: level_name,
            updated_at: new Date(),
        }, {
            where: {
                id: response.id
            }
        });
        res.status(200).json({
            message: "Data Berhasil diupdate",
        })
    } catch (error) {
        res.status(400).json({
            message: error.message,
        })
    };
}

export const deleteLevelUser = async(req, res) => {
    const response = await LevelUsers.findOne({
        where: {
            id: params.id
        }
    });
    if (!response) {
        return res.status(404).json({
            message: "Data tidak ditemukan",
        })
    }
    try {
        await LevelUsers.destroy({
            where: {
                id: response.id,
            }
        });
        return res.status(200).json({
            message: "Data berhasil dihapus"
        })
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        })
    }
}