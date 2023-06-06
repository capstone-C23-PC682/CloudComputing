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
const Product = require('../models/product');

const product = firestore.collection('products');


const addProduct = async (req, res, next) => {
    try {
        const data = req.body;
        await product.doc().set(data);
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllProducts = async (req, res, next) => {
    try {
        const products = await product;
        const data = await products.get();
        const productsArray = [];
        if (data.empty) {
            res.status(404).send('No product record found');
        } else {
            data.forEach(doc => {
                const product = new Product(
                    doc.id,
                    doc.data().name,
                    doc.data().desc,
                    doc.data().type
                );
                productsArray.push(product);
            });
            res.send(productsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
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