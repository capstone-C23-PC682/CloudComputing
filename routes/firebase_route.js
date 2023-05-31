const express = require('express');
const { nanoid } = require('nanoid');
const router = express.Router();
const crypto = require('crypto');
const FIREBASE_API = require('../functions/firebase_api.js');
const  auth  = require('../functions/auth.js');

router.post('/api/signup', async (req, res) => {
    const{
            fname,
            lname,
            age,
            email,
            password
        }=req.body
        const id = nanoid(16);
        const registerat=new Date().toISOString();
        const collection=[];
        const historyid=[];
        
        const newUser={
            id,
            fname,
            lname,
            age,
            email,
            registerat,
            collection,
            historyid,
        };
        const passwords = crypto.createHash('sha512').update(Buffer.from(password).toString('base64')).digest('hex');
        const newAcc={
            email,
            passwords
        }
        if (!fname || !lname || !age || !email || !password) {
            return res.status(400).json({
              status: 'fail',
              message: 'Please fill completely',
            });
          }
        try {
            let result = await FIREBASE_API.createaccount(newUser,newAcc);
            res.send(result);
          } catch (error) {
            console.error('Error creating account:', error);
            res.status(500).json({
              status: 'error',
              message: 'failed to create a account',
            });
          }
});
router.post('/api/login',async (req,res)=>{
    const{email,password}=req.body
    const passwords=  crypto.createHash('sha512').update(Buffer.from(password).toString('base64')).digest('hex')
    let result = await FIREBASE_API.loginLogic(email,passwords);
    res.send({
       result,
    });
})
router.get('/api/get-data',auth, async (req, res) => {

    let result = await FIREBASE_API.getDocuments();
    const filteredData = result.docs.filter(doc => doc.id === req.account.id);
    
    res.send(filteredData);
});

module.exports = {
    router
};