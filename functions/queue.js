const {
    Firestore
} = require('@google-cloud/firestore');
const {
    Storage
} = require('@google-cloud/storage');
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
const storage = new Storage({
    projectId: CREDENTIALS.project_id,
    credentials: {
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key,
    },
});
firestore.settings({
    ignoreUndefinedProperties: true
})
const admin = require('firebase-admin');
const Queue = require('../models/queue');
const queue = firestore.collection('queues');
const bucketName = 'dataset_forml';
const bucket = storage.bucket(bucketName);

admin.initializeApp({
    credential: admin.credential.cert(CREDENTIALS)
});

const addQueue = async (req, res, next) => {
    const imageFile = req.file;

    if (!imageFile) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please upload an image file.',
        });
    }

    // const status = req.body;

    const id_final = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
    const name_final = `${id_final}_${Date.now()}`;
    const status_number = 0;
    let status = "Pending";
    if (status_number != 0) {
        status = "Success"
    }
    const filename = `${name_final}_${imageFile.originalname}`;
    const file = bucket.file(filename);
    const metadata = {
        contentType: imageFile.mimetype,
        cacheControl: 'max-age=720',
    };
    const stream = file.createWriteStream({
        metadata,
    });

    stream.on('error', (error) => {
        console.error('Error uploading image:', error);
        return res.status(500).json({
            error: 'Failed to upload image'
        });
    });

    stream.on('finish', () => {
        // const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();
        const serverTimestamp = admin.firestore.Timestamp.now();
        const seconds = serverTimestamp.seconds;
        const nanoseconds = serverTimestamp.nanoseconds;
        const jsDate = new Date(seconds * 1000 + nanoseconds / 1000000);
        const image = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        queue.add({
                id: id_final,
                name: name_final,
                time: serverTimestamp,
                image,
                status,
            })
            .then(() => {
                return res.status(200).json({
                    id: id_final,
                    name: name_final,
                    time: jsDate,
                    image,
                    status,
                });
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).json({
                    error: 'Failed to save image data'
                });
            });
    });

    stream.end(imageFile.buffer);
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