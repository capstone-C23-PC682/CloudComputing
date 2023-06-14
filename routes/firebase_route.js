const express = require('express');
const router = express.Router();
const FIREBASE_API = require('../functions/firebase_api.js');
const  auth  = require('../functions/auth.js');
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage });
const {imageUser}=require("../functions/imageBucket.js");
const {garbageDecision}= require("../functions/imageML.js");

router.post('/signup',FIREBASE_API.createaccount );
router.post('/login',FIREBASE_API.loginLogic)
router.get('/get-data',auth,FIREBASE_API.getUsers);
router.put('/update',auth,FIREBASE_API.updateUser);
router.post('/user/image', auth,multerUpload.single('image'),imageUser);
router.post('/imageml', auth,multerUpload.single('image'),garbageDecision);
router.get('/get-history',auth,FIREBASE_API.getHistory);
module.exports = {
    router
};