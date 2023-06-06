const express = require('express');
const {
    addQueue,
    getAllQueues,
    getQueue,
    updateQueue,
    deleteQueue
} = require('../functions/queue');

const router = express.Router();

router.post('/queue', addQueue);
router.get('/queues', getAllQueues);
router.get('/queue/:id', getQueue);
router.put('/queue/:id', updateQueue);
router.delete('/queue/:id', deleteQueue);


module.exports = {
    router
};