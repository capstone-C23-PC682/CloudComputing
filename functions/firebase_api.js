const { Firestore } = require('@google-cloud/firestore');
const auth=require('./auth.js')
const CREDENTIALS = require('../capstone-c23-pc682-61d81799d47b.json');
const jwt = require('jsonwebtoken');
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
const loginLogic= async(emai,password)=>{
    let datas="data";
    let ids='data';
    try {   
        let succes=await account.where("email",'=',emai).get();
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
              if(datas === password){
                console.log("berhasil")
                let mainaccount=await userInformation.where("email",'=',emai).get();
                mainaccount.forEach((docs)=>{
                    ids=docs.id
                    console.log(docs.data())
                    console.log(docs.id)
                })
                const token=createToken(ids);
                return{
                    status:"succes",
                    token:token
                }
            }else{
                return error
            };}
        
    } catch (error) {
        ;
        return {
            status:"fail",
            message: 'Email or Password is wrong'
        };
    }
    

}
const createaccount = async (user,users) => {

    try {   
        let succes=await account.where("email",'=',users.email).get();
        if (succes.empty){
        let record = await userInformation.add(user);
        let records = await account.add(users);
        return {
            status: "succes",
            id: record.id,
            idUser:records.id,
            
        };
        }

       

        
    } catch (error) {
        ;
        return {
            status:"fail",
            message: 'Failed to create account'
        };
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

module.exports = {
    loginLogic,
    createaccount,
    getDocuments,
};