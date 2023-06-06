const { Firestore } = require('@google-cloud/firestore');
const { nanoid } = require('nanoid');
const CREDENTIALS = require('../capstone-c23-pc682-61d81799d47b.json');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const firestore = new Firestore({
    projectId: CREDENTIALS.project_id,
    credentials: {
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    }
    
});
firestore.settings({ignoreUndefinedProperties: true})

const userInformation = firestore.collection('userInformation');
const account = firestore.collection('account');
const maxAge= 2*24*60*60;
const createToken=(id)=>{
    return jwt.sign({id},'apa aja boleh lhaa',{
        expiresIn: maxAge
    })
}
const loginLogic= async(req,res,next)=>{
    const{email,password}=req.body
    
    const passwords=  crypto.createHash('sha512').update(Buffer.from(password).toString('base64')).digest('hex')
    let datas="data";
    let ids='data';
    try {   
        let succes=await account.where("email",'=',email.toLowerCase()).get();
        if(succes.empty){
            return{
                status:"fail",
            message: 'Email or Password is wrong'
            }
        }else {
            succes.forEach((doc) => {
                datas=doc.data().passwords;
               ;
              })
              if(datas === passwords){
                console.log("berhasil")
                let mainaccount=await userInformation.where("email",'=',email.toLowerCase()).get();
                mainaccount.forEach((docs)=>{
                    ids=docs.id
                })
                const token=createToken(ids);
                res.send({
                    status:"succes",
                    token:token
                })
            }else{
                return error
            };}
        
    } catch (error) {
        ;
        res.send ({
            status:"fail",
            message: 'Email or Password is wrong'
        });
    }
    

}

const createaccount = async (req,res,next) => {
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
            const image="null";
            const newUser={
                id,
                fname,
                lname,
                age,
                email:email.toLowerCase(),
                registerat,
                collection,
                historyid,
                image
            };
            const passwords = crypto.createHash('sha512').update(Buffer.from(password).toString('base64')).digest('hex');
            const newAcc={
                email:email.toLowerCase(),
                passwords
            }
            if (!fname || !lname || !age || !email || !password) {
                return res.status(400).json({
                  status: 'fail',
                  message: 'Please fill completely',
                });
              }
            try {
                let succes=await account.where("email",'=',newAcc.email).get();
                if (succes.empty){
                let record = await userInformation.add(newUser);
                let records = await account.add(newAcc);
                res.send({
                    status: "succes",
            id: record.id,
            idUser:records.id,}
                )
              } }catch (error) {
                console.error('Error creating account:', error);
                res.status(500).json({
                  status: 'error',
                  message: 'failed to create a account',
                });
              }
    };


const getDocuments = async () => {

    try {
        let querySnapshot = await userInformation.get();
        if (querySnapshot.empty) {
            return {
                status: -1,
                docs: []
            };
        } else {
            let docs = []
            querySnapshot.forEach(QueryDocumentSnapshot => {
                let tempData = QueryDocumentSnapshot.data();
                tempData['id'] = QueryDocumentSnapshot.id;
                docs.push(tempData);
            });
            return {
                status: 1,
                docs: docs
            };
        }
    } catch (error) {
        console.log(`Error at getDocuments --> ${error}`);
        return {
            Error
        };
    }
};

const getUsers=  async (req, res) => {
    const ids=req.account.id;
    try {
        const data= await userInformation.doc(ids);
        let snapshot=  await data.get();
        if (snapshot.exists){
            res.send({
                status:'Success',
                data:snapshot.data()
            });
        }else{
            res.send({
                status:'Fail',
                message:'User not found'
            })
        }
    } catch (error) {
        return{
            status:'Error',
            message:'Failed to get data',
        }
    }
}
const updateUser=async(req,res)=>{
        const ids=req.account.id;
        const{fname,lname,age,}=req.body;
        if (!fname || !lname || !age) {
          return res.status(400).json({
            status: 'fail',
            message: 'Please Fill all.',
          });
        };
    const data={fname,lname,age}
    try {
        const database=await userInformation.doc(ids);
        await database.update(data);
        const catchSnapshot= await database.get();
        const updateUser= {
            ids:catchSnapshot.id, ...catchSnapshot.data(),
        };
        res.send( {
            status:'Success',
            message:'User Updated',
            data:updateUser
        })
    } catch (error) {
        res.send({
            status:"Fail",
            message:"Failed to update user"
        });
        
    }
}
const updateUserImage=async(id,data)=>{
    if(!data){
        throw({
            status: 'fail',
            message: 'Please Fill all.',
          });
    }
    try {
        const succes=await userInformation.doc(id);
        await succes.update(data);
        const catchSnapshot= await succes.get();
        const updateUser= {
            ids:catchSnapshot.id, ...catchSnapshot.data(),
        };
        return updateUser
    } catch (error) {

        throw{
            status: 'error',
            message: 'Failed to update user.',
            error:error.message
        }
    }
}

module.exports = {
    loginLogic,
    createaccount,
    getDocuments,
    getUsers,
    updateUser,
    updateUserImage
};