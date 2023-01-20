const fetch = require('node-fetch');
const path = require("path");
const http = require('http');
const fs = require('fs');
require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('public'))


app.get('/', (req, res) => {
  res.sendFile(path.join(public + '/index.html'));
});


app.listen(3000, () => {
  console.log('Server is listening on port 3000')
})


async function send_message() {
      const message = "It's time to wake up from your quick nap! We hope you found the nap refreshing and energizing. Remember that taking short naps throughout the day can improve your focus, productivity, and overall well-being.      Don't forget to stretch, get some water, and maybe even do a quick exercise before diving back into work."
      console.log("notification sent!")

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
              "email": process.env.EMAIL,            },
            "content": {
              "title": "Time to Wake Up!",
              "body": message
            },
            "routing": {
              "method": "all",
              "channels": ["email"]
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


