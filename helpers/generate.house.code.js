import { Sequelize } from "sequelize";
import { Houses } from "../models/index.model.js";

const sanitizeCityName = (city) => {
    if (!city) return "UNKNOWN";
    return city
        .toUpperCase()
        .replace(/^KOTA\s+/i, '')
        .replace(/^KABUPATEN\s+/i, '')
        .trim();
};

const generateCityCode = (cityName) => {
    const cleanCity = sanitizeCityName(cityName);
    const words = cleanCity.split(" ");
    const getMainCode = (word) => {
        const consonants = word.replace(/[AIUEO]/g, '');
        if (consonants.length >= 3) {
            return consonants.substring(0, 3);
        }
        return word.substring(0, 3).padEnd(3, 'X');
    };
    if (words.length === 1) {
        return getMainCode(words[0]);
    }
    const mainCity = words[0];
    const direction = words[1];
    return `${getMainCode(mainCity)}${direction[0]}`;
};

export const generateHouseCode = async (city, transaction = null) => {
    const cityCode = generateCityCode(city);
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateCode = `${yy}${mm}${dd}`;
    const lastHouse = await Houses.findOne({
        where: Sequelize.where(
            Sequelize.fn('LEFT', Sequelize.col('house_code'), cityCode.length),
            cityCode
        ),
        order: [['house_code', 'DESC']],
        transaction
    });

    let nextNumber = 1;
    if (lastHouse?.house_code) {
        const lastNumber = lastHouse.house_code.split('-')[2];
        if (lastNumber) {
            nextNumber = parseInt(lastNumber) + 1;
        }
    }
    const runningNumber = String(nextNumber).padStart(4, '0');
    return `${cityCode}-${dateCode}-${runningNumber}`;
};
