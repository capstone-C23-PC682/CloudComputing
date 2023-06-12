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
    /*try {
        const data = req.body;
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        data.time = timestamp;
        await queue.doc().set(data);
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }*/

    if (!req.file) {
        return res.status(400).json({
            error: 'No image file provided'
        });
    }

    const {
        name,
        status
    } = req.body;

    if (!name|| !status) {
        return res.status(400).json({
            error: 'Name and status are required fields'
        });
    }

    // Mendapatkan file yang diunggah
    const file = req.file;

    // Menentukan path file di cloud storage
    //   const storagePath = `images/${file.originalname}`;
    const storagePath = `${Date.now()}_${file.originalname}`;;

    // Mengunggah file ke bucket cloud storage
    const fileUpload = bucket.file(storagePath);
    const blobStream = fileUpload.createWriteStream();

    blobStream.on('error', (error) => {
        console.error(error);
        return res.status(500).json({
            error: 'Failed to upload image'
        });
    });

    blobStream.on('finish', () => {
        // Mendapatkan waktu server saat ini
        const serverTimestamp =admin.firestore.FieldValue.serverTimestamp();
        // Simpan data ke Firestore atau lakukan tindakan lainnya
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        //  Menyimpan data ke Firestore
        queue.add({
                name,
                time: serverTimestamp,
                imageUrl,
                status,
            })
            .then(() => {
                return res.status(200).json({
                    imageUrl
                });
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).json({
                    error: 'Failed to save image data'
                });
            });
    });

    blobStream.end(file.buffer);
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