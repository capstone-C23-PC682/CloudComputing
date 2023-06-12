const express = require('express');
const {
    addQueue,
    getAllQueues,
    getQueue,
    updateQueue,
    deleteQueue
} = require('../functions/queue');
const router = express.Router();
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const multerUpload = multer({
    storage: multerStorage
});

router.post('/queue', multerUpload.single('image'), addQueue);
router.get('/queues', getAllQueues);
router.get('/queue/:id', getQueue);
router.put('/queue/:id', updateQueue);
router.delete('/queue/:id', deleteQueue);


module.exports = {
    router
};