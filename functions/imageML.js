const {
    Firestore
} = require('@google-cloud/firestore');
const FormData = require('form-data');
const CREDENTIALS = require('../capstone-c23-pc682-61d81799d47b.json');
const axios = require('axios');
const firestore = new Firestore({
    projectId: CREDENTIALS.project_id,
    credentials: {
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    }

});
const admin = require('firebase-admin');
firestore.settings({
    ignoreUndefinedProperties: true
});
const urlFunction="https://us-central1-capstone-c23-pc682.cloudfunctions.net/predict";
const history = firestore.collection('historyML');
const product = firestore.collection('products');

const userInformation = firestore.collection('userInformation');
const garbageDecision = async (req,res,next) => {
const userId = req.account.id;
const imageFile = req.file;
let stat='pending'
let datas='not found';
const serverTimestamp =admin.firestore.FieldValue.serverTimestamp();

if (!imageFile) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please upload an image file.',
    });
  }
try {
    const data=await pushtoFunction(imageFile,userId);
    if(data){
        stat='success'
        datas=data
        const historyUser={
            userId,
            registerat:serverTimestamp,
            status:stat,
            data:datas
        }
        let fire = await history.add(historyUser); 
         const success=await updateUserarray(userId,fire.id,data)
        if(success){res.json({
            status: "success",
    data: success,})}
     if(!data){
        stat='fail'
        datas='not found'
        const historyUser={
            userId,
            registerat:serverTimestamp,
            status:stat,
            data:datas
        }
        let fire= await history.add(historyUser);
       
        res.status(200).json({
            status: "fail",
    data: fire.id,
        })
    }}
} catch (error) {
    res.status(500).json({
        error:error,
        message:"failed to progress"
        
    })
}

async function pushtoFunction(image) {
    try {
      const formData = new FormData();

      formData.append('file', image.buffer,{ 
        filename: image.originalname,
        contentType: image.mimetype,});
  
      const response=await axios.post(urlFunction, formData, {
        headers: {
          'Content-Type': formData.getHeaders(),
        },
      });

      console.log('Image successfully forwarded to Cloud Function.');
      return response.data.class
    } catch (error) {
      console.error('Error forwarding image to Cloud Function:', error);
      throw error;
    }
  }
}

const updateUserarray= async(id,histroyid,collection)=>{
    let penentu=1;
    try {
        const user = await userInformation.doc(id).get();
        if (!user.exists) {
          throw new Error('User does not exist');
        }
        const userData = user.data();
    

        if (userData.collection.includes(collection)) {
          penentu=0
        }
        const updatedHistoryId = [...userData.historyid, histroyid];
        const updatedCollection = [...userData.collection, collection];
        
        if(penentu===0){
            await userInformation.doc(id).update({
                historyid: updatedHistoryId,
              });
        }else if(penentu===1){
        await userInformation.doc(id).update({
          historyid: updatedHistoryId,
          collection: updatedCollection
        })}
    
        console.log('User fields updated successfully');
        const query= product.where('id','==',collection).limit(1);
        const snapshot = await query.get();
        if (snapshot.empty) {
            console.log('No matching document found.');
            return;
          }
        const doc = snapshot.docs[0];
        const data = doc.data();
        return data;

    
      } catch (error) {
        console.error('Error updating user fields:', error);
        throw error;
      }
}

module.exports = {
  garbageDecision
}