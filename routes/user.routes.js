import express from "express";
import {
    updateUser,
    getCertificateTypes,
    getHouse,
    getHouseByUserIdPending,
    getHouseByUserIdWaitingPayment,
    getHouseByUserIdProcessing,
    getHouseByUserIdApproved,
    getHouseByUserIdRejected,
    getHouseByUserDelete,
    deleteHouseByUser,
    getHouseAdvertisementDetail,
    getHouseModelAdvertisement,
    getPresignedUrls,
    addHouse,
    getSearchHouse,
    getSearchHouseDetail,
    getSearchHouseModel,
    getProvinces,
    getCountHouseByUserId,
} from "../controllers/user.js"

const router = express.Router();

router.get("/", (req, res) => {
    res.send("User route root is working");
});
router.patch('/:id', updateUser);
router.get('/certificate-types', getCertificateTypes)
router.get('/house', getHouse)
router.get('/search', getSearchHouse)
router.get('/search/detail/:id', getSearchHouseDetail)
router.get('/search/detail/model/:id', getSearchHouseModel)

router.get('/advertisement/pending', getHouseByUserIdPending)
router.get('/advertisement/waiting-payment', getHouseByUserIdWaitingPayment)
router.get('/advertisement/processing', getHouseByUserIdProcessing)
router.get('/advertisement/approved', getHouseByUserIdApproved)
router.get('/advertisement/rejected', getHouseByUserIdRejected)
router.get('/advertisement/delete', getHouseByUserDelete)
router.delete('/advertisement/delete/:id', deleteHouseByUser)

router.get('/advertisement/detail/:id', getHouseAdvertisementDetail);
router.get('/advertisement/detail/model/:id', getHouseModelAdvertisement);

router.post('/advertisement/presigned-urls', getPresignedUrls);
router.post('/advertisement/add', addHouse);

router.get('/provinces', getProvinces);

router.get('/advertisement/count', getCountHouseByUserId);

export default router;