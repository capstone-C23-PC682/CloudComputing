const { Storage } = require('@google-cloud/storage');
const updateImage= require('./firebase_api');
const CREDENTIALS = require('../capstone-c23-pc682-61d81799d47b.json');

const storage = new Storage({
  projectId: CREDENTIALS.project_id,
  credentials: {
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  },
});
const bucketName = 'image_profile_trascan';
const bucket = storage.bucket(bucketName);



const imageUser=  async (req, res) => {
  const userId = req.account.id;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please upload an image file.',
    });
  }

  const filename = `${userId}_${Date.now()}_${imageFile.originalname}`;

  try {
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
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload image.',
      });
    });

    stream.on('finish', async () => {
      try {
        const imageUsers = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        await file.makePublic();
        const success=await updateImage.updateUserImage(userId,{image:imageUsers});
        res.json({
          status: 'success',
          message: 'User image uploaded successfully.',
          data:success,
        });
      } catch (error) {
        console.error('Error making image public:', error);
        res.status(500).json({
          status: 'error',
          message: 'Failed to upload image.',
        });
      }
    });

    stream.end(imageFile.buffer);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload image.',
    });
  }
}
module.exports={imageUser}