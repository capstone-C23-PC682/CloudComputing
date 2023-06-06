const express = require('express');
const router = express.Router();
const FIREBASE_API = require('../functions/firebase_api.js');
const  auth  = require('../functions/auth.js');
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage });
const {imageUser}=require("../functions/imageBucket.js")
router.post('/api/signup',FIREBASE_API.createaccount );
router.post('/api/login',FIREBASE_API.loginLogic)
router.get('/api/get-data',auth,FIREBASE_API.getUsers);
router.put('/api/update',auth,FIREBASE_API.updateUser);
router.post('/api/user/image', auth,multerUpload.single('image'),imageUser)
module.exports = {
    router
};