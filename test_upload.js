const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function upload() {
  const form = new FormData();
  form.append('file', fs.createReadStream('sample_trades.csv'));
  form.append('type', 'EXPECTED');

  try {
    const res = await axios.post('http://localhost:5000/api/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    });
    console.log('Upload success:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Upload failed:', err.response ? err.response.data : err.message);
  }
}

upload();
