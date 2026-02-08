import db from "../config/database.js";
import Users from "./user.model.js";
import LevelUsers from "./level.user.model.js";
import Houses from "./houses.model.js";
import Certificates from "./certificate.model.js";
import CertificateTypes from "./certificate.types.model.js";
import Facilities from "./facilities.model.js";
import HouseFacilities from "./house.facilities.model.js";
import GeneralFacilityTypes from "./general_facility_types.model.js";
import GeneralFacilities from "./general.facilities.model.js";
import HouseProcesses from "./house.processes.model.js";
import Address from "./address.model.js";
import HousePhotos from "./house.photos.model.js";
import Payments from "./payments.model.js";
import HouseSurveys from "./house.surveys.model.js";
import HouseDesigns from "./house.designs.model.js";
import HouseSurveyRevs from "./house.survey.revs.model.js";
import HouseDesignRevs from "./house.design.rev.model.js";

// Users
Users.belongsTo(LevelUsers, {
    foreignKey: 'level_user_id'
});

Users.hasMany(Houses, {
    foreignKey: 'user_id'
});

Users.hasMany(HouseSurveys, {
    foreignKey: "user_id",
});

Users.hasMany(HouseDesigns, {
    foreignKey: "user_id",
});

// LevelUsers
LevelUsers.hasMany(Users, {
    foreignKey: 'level_user_id'
});


// Houses
Houses.belongsTo(Users, {
    foreignKey: 'user_id'
});

Houses.hasMany(HouseFacilities, {
    foreignKey: 'house_id'
});

Houses.hasMany(GeneralFacilities, {
    foreignKey: 'house_id'
});

Houses.hasOne(HouseProcesses, {
    foreignKey: "house_id",
});

Houses.hasOne(Certificates, {
    foreignKey: "house_id",
});

Houses.hasOne(Address, {
    foreignKey: "house_id",
});

Houses.hasMany(HousePhotos, {
    foreignKey: "house_id",
});

Houses.hasMany(Payments, {
    foreignKey: "house_id",
});

Houses.hasOne(HouseSurveys, {
    foreignKey: "house_id",
});

Houses.hasOne(HouseDesigns, {
    foreignKey: "house_id",
});

// CertificateTypes
CertificateTypes.hasMany(Certificates, {
    foreignKey: 'certificate_type_id'
});


// Certificates
Certificates.belongsTo(CertificateTypes, {
    foreignKey: 'certificate_type_id'
});

Certificates.belongsTo(Houses, {
    foreignKey: "house_id",
});

// Facilities
Facilities.hasMany(HouseFacilities, {
    foreignKey: 'facility_id'
});

// HouseFacilities
HouseFacilities.belongsTo(Facilities, {
    foreignKey: 'facility_id'
});

HouseFacilities.belongsTo(Houses, {
    foreignKey: 'house_id'
});

// GeneralFacilityTypes
GeneralFacilityTypes.hasMany(GeneralFacilities, {
    foreignKey: 'type_id'
});

// GeneralFacilities
GeneralFacilities.belongsTo(GeneralFacilityTypes, {
    foreignKey: 'type_id'
});

GeneralFacilities.belongsTo(Houses, {
    foreignKey: 'house_id'
});

// HouseProcesses
HouseProcesses.belongsTo(Houses, {
    foreignKey: "house_id",
});

HouseProcesses.hasMany(HouseSurveyRevs, {
    foreignKey: "house_survey_id",
});

HouseProcesses.hasMany(HouseDesignRevs, {
    foreignKey: "house_design_id",
});

// Address
Address.belongsTo(Houses, {
    foreignKey: "house_id",
});

// HousePhotos
HousePhotos.belongsTo(Houses, {
    foreignKey: "house_id",
});

// Payments
Payments.belongsTo(Houses, {
    foreignKey: "house_id",
});

// HouseSurveys
HouseSurveys.belongsTo(Houses, {
    foreignKey: "house_id",
});

HouseSurveys.belongsTo(Users, {
    foreignKey: "user_id",
});

// HouseDesigns
HouseDesigns.belongsTo(Houses, {
    foreignKey: "house_id",
});

HouseDesigns.belongsTo(Users, {
    foreignKey: "user_id",
});

// HouseSurveyRevs
HouseSurveyRevs.belongsTo(HouseProcesses, {
    foreignKey: "house_survey_id",
});

// HouseDesignRevs
HouseDesignRevs.belongsTo(HouseProcesses, {
    foreignKey: "house_design_id",
});

export {
    db,
    Users,
    LevelUsers,
    Houses,
    Certificates,
    CertificateTypes,
    Facilities,
    HouseFacilities,
    GeneralFacilityTypes,
    GeneralFacilities,
    HouseProcesses,
    Address,
    HousePhotos,
    Payments,
    HouseSurveys,
    HouseDesigns,
    HouseSurveyRevs,
    HouseDesignRevs,
};