import express from "express";
import {
    updateUser,
    getCertificateTypes,
    getHouse,
    getHouseByUserIdPending,
    getHouseByUserId3dOffer,
    getHouseByUserIdWaitingPayment,
    getHouseByUserIdProcessing,
    getHouseByUserIdApproved,
    getHouseByUserIdRejected,
    getHouseByUserDelete,
    getHouseAdvertisementDetail,
    getHouseModelAdvertisement,
    addHouse,
    getSearchHouse,
    getSearchHouseDetail,
    getSearchHouseModel,
} from "../controllers/user.js"

const router = express.Router();

router.patch('/:id', updateUser);
router.get('/certificate-types', getCertificateTypes)
router.get('/house', getHouse)
router.get('/search', getSearchHouse)
router.get('/search/detail/:id', getSearchHouseDetail)
router.get('/search/detail/model/:id', getSearchHouseModel)

router.get('/advertisement/pending', getHouseByUserIdPending)
router.get('/advertisement/3d-offering', getHouseByUserId3dOffer)
router.get('/advertisement/waiting-payment', getHouseByUserIdWaitingPayment)
router.get('/advertisement/processing', getHouseByUserIdProcessing)
router.get('/advertisement/approved', getHouseByUserIdApproved)
router.get('/advertisement/rejected', getHouseByUserIdRejected)
router.get('/advertisement/delete', getHouseByUserDelete)

router.get('/advertisement/detail/:id', getHouseAdvertisementDetail);
router.get('/advertisement/detail/model/:id', getHouseModelAdvertisement);

router.post('/advertisement/add', addHouse);

export default router;