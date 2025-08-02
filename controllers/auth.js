import { Users } from "../models/index.model.js";
import argon2 from "argon2";

export const register = async(req, res) => {
    const {level_user_id, username, email, password, confirmPassword} = req.body;
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
            message: "Register berhasil",
        })
    } catch (error) {
        res.status(400).json({
            message: error.message,
        })
    }
}

export const login = async(req, res) => {
    const response = await Users.findOne({
        where: {
            email: req.body.email
        }
    });
    if (!response) {
        return res.status(404).json({
            message: "User tidak ditemukan"
        });
    };
    const match = await argon2.verify(response.password, req.body.password);
    if (!match) {
        return res.status(400).json({
            message: "Password salah"
        });
    }
    req.session.userId = response.uuid;

    const uuid = response.uuid;
    const name = response.username;
    const email = response.email;
    const level_status_id = response.level_status_id;

    res.status(200).json({
        uuid,
        name,
        email,
        level_status_id,
        message: "Login berhasil",
    })
};

export const me = async(req, res) => {
    if (!req.session.userId) {
        res.status(401).json({
            message: "Mohon login ke akun anda"
        });
    };
    const response = await Users.findOne({
        attributes: [
            'uuid',
            'username',
            'email',
            'level_user_id',
        ],
        where: {
            uuid: req.session.userId
        }
    });
    if (!response) {
        return res.status(404).json({
            message: "User tidak ditemukan"
        });
    };
    res.status(200).json(response)
}

export const logout = async(req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(400).json({
                message: "Tidak dapat logout",
            });
        };
        res.status(200).json({
            message: "Anda telah logout",
        });
    });
}