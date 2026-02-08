import express from "express";
import {
    getHouse,
    getHouseStatusPending,
    getHouseDetail,
    updateHousePendingToOffering,
    updateHousePendingToRejected,
    getHouse3DModel,
    getHouseInputQr,
    postHouseInputQr,
    getHouseStatus3dYes,
    updateHousePaymentConfirm,
    getHouseGeoCoordinate,
    postGeoCoordinate,
    getSurveyListHouse,
    getSurveyHasilInput,
    approveInputHasilSurvey,
    getDesignListHouse,
    getDesignHasilInput,
    approveInputHasilDesign,
    revInputHasilSurvey,
    getSurveyRevisionListHouse,
} from "../controllers/admin.js";

const router = express.Router();

router.get('/house/house-list', getHouse);
router.get('/house/model/:id', getHouse3DModel);
router.get('/house/pending', getHouseStatusPending);
router.get('/house/detail/:id', getHouseDetail);
router.patch('/house/pending-to-offer/:id', updateHousePendingToOffering);
router.patch('/house/pending-to-reject/:id', updateHousePendingToRejected);
router.get('/house/input-qr', getHouseInputQr);
router.post('/house/input-qr', postHouseInputQr);
router.get('/house/payment-confirm', getHouseStatus3dYes);
router.patch('/house/payment-confirm/:id', updateHousePaymentConfirm);
router.get('/house/geo-coordinate', getHouseGeoCoordinate);
router.patch('/house/geo-coordinate/:id', postGeoCoordinate);

router.get('/survey/house-list', getSurveyListHouse);
router.get('/survey/survey-input', getSurveyHasilInput);
router.patch('/survey/survey-input/:id', approveInputHasilSurvey);
router.patch('/survey/revision/:id', revInputHasilSurvey);
router.get('/survey/revision-house-list', getSurveyRevisionListHouse);

router.get('/design/house-list', getDesignListHouse);
router.get('/design/design-input', getDesignHasilInput);
router.patch('/design/design-input/:id', approveInputHasilDesign);

export default router;