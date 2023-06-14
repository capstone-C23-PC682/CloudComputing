const {
    Firestore
} = require('@google-cloud/firestore');
const {
    Storage
} = require('@google-cloud/storage');
const CREDENTIALS = require('../capstone-c23-pc682-61d81799d47b.json');
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
const product = firestore.collection('products');
const bucketName = 'productgarbage';
const bucket = storage.bucket(bucketName);

const addProduct = async (req, res, next) => {
   
    const {
        name,
        type,
        desc,
        id
    } = req.body;
 

    if (!name || !type || !desc) {
        return res.status(400).json({
            error: 'Name or type or desc are required fields'
        });
    }

    // Mendapatkan file yang diunggah
    const file = req.file;
    if (!req.file) {
        return res.status(400).json({
            error: 'No image file provided'
        });
    }
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
        const serverTimestamp =admin.firestore.FieldValue.serverTimestamp();
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        product.add({
                name,
                desc,
                imageUrl,
                type,
                id,
                createAt: serverTimestamp,
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

const getAllProducts = async (req, res, next) => {
    try {
        let querySnapshot = await product.get();
        if (querySnapshot.empty) {
            return {
                status: -1,
                products: []
            };
        } else {
            let products = []
            querySnapshot.forEach(QueryDocumentSnapshot => {
                let tempData = QueryDocumentSnapshot.data();
                tempData['id'] = QueryDocumentSnapshot.id;
                products.push(tempData);
            });
           res.send({
            products
           })
        }
    } catch (error) {
        res.status(400).send(error.message)
        };
    }
    

const getProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const product = await product.doc(id);
        const data = await product.get();
        if (!data.exists) {
            res.status(404).send('Product with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const product = await product.doc(id);
        await product.update(data);
        res.send('Product record updated successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        await product.doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
}