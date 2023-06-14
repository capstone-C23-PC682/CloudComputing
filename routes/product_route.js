const express = require('express');
const {
    addProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require('../functions/product');

const router = express.Router();
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const multerUpload = multer({
    storage: multerStorage
});

router.post('/product',multerUpload.single('image'), addProduct);
router.get('/products', getAllProducts);
router.get('/product/:id', getProduct);
router.put('/product/:id', updateProduct);
router.delete('/product/:id', deleteProduct);


module.exports = {
    router
};