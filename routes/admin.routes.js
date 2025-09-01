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
    getHouseSurveyReq,
    getHouseDesignReq,
    approveRequestSurvey,
    rejectRequestSurvey,
    approveRequestDesign,
    rejectRequestDesign,
    getSurveyListHouse,
    getSurveyHasilInput,
    approveInputHasilSurvey,
    getDesignListHouse,
    getDesignHasilInput,
    approveInputHasilDesign,
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
router.get('/request/survey-request', getHouseSurveyReq);
router.get('/request/design-request', getHouseDesignReq);
router.patch('/request/reject-survey-request/:id', rejectRequestSurvey);
router.patch('/request/approve-survey-request/:id', approveRequestSurvey);
router.patch('/request/reject-design-request/:id', rejectRequestDesign);
router.patch('/request/approve-design-request/:id', approveRequestDesign);

router.get('/survey/house-list', getSurveyListHouse);
router.get('/survey/survey-input', getSurveyHasilInput);
router.patch('/survey/survey-input/:id', approveInputHasilSurvey);

router.get('/design/house-list', getDesignListHouse);
router.get('/design/design-input', getDesignHasilInput);
router.patch('/design/design-input/:id', approveInputHasilDesign);

export default router;