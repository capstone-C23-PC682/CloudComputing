const {
    Firestore
} = require('@google-cloud/firestore');
const auth = require('./auth.js')
const CREDENTIALS = require('../capstone-c23-pc682-61d81799d47b.json');
const jwt = require('jsonwebtoken');
const firestore = new Firestore({
    projectId: CREDENTIALS.project_id,
    credentials: {
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    }

});
firestore.settings({
    ignoreUndefinedProperties: true
})
const admin = require('firebase-admin');
const Queue = require('../models/queue');

const queue = firestore.collection('queues');

admin.initializeApp({
    credential: admin.credential.cert(CREDENTIALS)
});

const addQueue = async (req, res, next) => {
    try {
        const data = req.body;
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        data.time = timestamp;
        await queue.doc().set(data);
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllQueues = async (req, res, next) => {
    try {
        const queues = await queue;
        const data = await queues.get();
        const queuesArray = [];
        if (data.empty) {
            res.status(404).send('No queue record found');
        } else {
            data.forEach(doc => {
                const queue = new Queue(
                    doc.id,
                    doc.data().name,
                    doc.data().time,
                    doc.data().image,
                    doc.data().status
                );
                queuesArray.push(queue);
            });
            res.send(queuesArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getQueue = async (req, res, next) => {
    try {
        const id = req.params.id;
        const queue = await queue.doc(id);
        const data = await queue.get();
        if (!data.exists) {
            res.status(404).send('Queue with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateQueue = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const queue = await queue.doc(id);
        await queue.update(data);
        res.send('Queue record updated successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteQueue = async (req, res, next) => {
    try {
        const id = req.params.id;
        await queue.doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addQueue,
    getAllQueues,
    getQueue,
    updateQueue,
    deleteQueue
}