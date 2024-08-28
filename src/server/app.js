
const express = require('express');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dxcp5qv1b', 
  api_key: '631848336714967', 
  api_secret: 'Y0Go5ew1s3Zl9_fasfQkyL71m78' 
});

const app = express();


app.delete('/images/:public_id', (req, res) => {
  const public_id = req.params.public_id;

  cloudinary.uploader.destroy(public_id)
    .then(result => {
      if (result.result === 'ok') {
        res.json({ success: true, message: 'Image deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete image' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Error deleting image', message: error.message });
    });
}); 


app.get('/images', (req, res) => {
  cloudinary.api.resources({ type: 'upload' })
    .then(result => {
      res.json(result.resources);
    })
    .catch(error => {
      res.status(500).json({ error: 'Error fetching images', message: error.message });
    });
});

const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
