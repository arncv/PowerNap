const fetch = require('node-fetch');
const path = require("path");
const http = require('http');
const fs = require('fs');
require('dotenv').config()
const express = require('express')
const rateLimit = require("express-rate-limit");
const app = express();
const bodyParser = require('body-parser');
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP"
});
app.use(limiter);

app.use(bodyParser.json());

app.use(express.static('public'))


app.get('/', (req, res) => {
  res.sendFile(path.join(public + '/index.html'));
});


app.listen(3000, () => {
  console.log('Server is listening on port 3000')
})


async function send_message() {
      const message = process.env.MESSAGE;
      console.log("Notification Successfully sent!")

    const courier_options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.APIKEY
        },
        body: JSON.stringify({
          "message": {
            "to": {
              "email": process.env.EMAIL,
              "phone_number": process.env.PHONENUMBER
            },
            "content": {
              "title": "Time to Wake Up!",
              "body": message
            },
            "routing": {
              "method": "all",
              "channels": ["sms","email"]
            },
          }
        })
      };
      
      fetch('https://api.courier.com/send', courier_options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));

}

app.post('/send-message', (req, res) => {
  send_message();
  res.json({ message: 'message sent' });
});


