import express from "express";
import {
    getListHouse,
    getHouseDetail,
    getListHouseNeedSurvey,
    getListHouseInput,
    getGeneralFacilityTypes,
    postInputHouseSurvey,
    startSurvey,
    getSurveyNeedRevListHouse,
    revHouseSurvey,
    CountSurveyHouse,
} from "../controllers/surveyor.js";

const router = express.Router();

router.get('/house-list', getListHouse);
router.get('/house-detail/:id', getHouseDetail);
router.get('/need-survey', getListHouseNeedSurvey);
router.get('/result-input', getListHouseInput); 
router.patch('/start-survey/:id', startSurvey);
router.get('/general-facility-types', getGeneralFacilityTypes);
router.post('/input-house-survey', postInputHouseSurvey);
router.get('/rev-house-survey', getSurveyNeedRevListHouse);
router.put('/rev-house-survey', revHouseSurvey);
router.get('/count-survey', CountSurveyHouse);

export default router;