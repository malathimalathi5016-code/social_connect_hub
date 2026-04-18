const express = require('express');
const app = express();

const VERIFY_TOKEN = "my_secret_token"; // must match the dashboard

app.get('/api/instagram/logout', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge); // respond with challenge
  } else {
    res.sendStatus(403); // invalid token
  }
});

app.post('/api/instagram/logout', (req, res) => {
  console.log('Webhook event:', req.body);
  res.sendStatus(200);
});

app.listen(5000, () => console.log('Server running on port 5000'));
