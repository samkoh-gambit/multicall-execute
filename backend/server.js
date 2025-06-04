require('dotenv').config();
const express = require('express');
const cors = require('cors');
const execute = require('./execute'); // You will need to export a function from execute.js

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/execute', async (req, res) => {
    console.log('Received transfers:', req.body.transfers);
    try {
      const transfers = req.body.transfers;
      console.log('Calling execute...');
      const result = await execute(transfers);
      console.log('Execute finished:', result);
      res.json({ success: true, result });
    } catch (err) {
      console.error('Error in /api/execute:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));