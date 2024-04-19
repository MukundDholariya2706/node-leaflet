// server/server.js

const express = require("express");
const bodyParser = require("body-parser");
const Pusher = require("pusher");
require('dotenv').config()

// create a express application
const app = express();

// initialize pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// to Allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/pusher/auth", (req, res) => {
  let socketId = req.body.socket_id;
  let channel = req.body.channel_name;
  let random_string = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);
  let presenceData = {
    user_id: random_string,
    user_info: {
      username: "@" + random_string,
    },
  };
  let auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});

app.post("/update-location", (req, res) => {
  // trigger a new post event via pusher
  pusher.trigger("presence-channel", "location-update", {
    username: req.body.username,
    location: req.body.location,
  });
  res.json({ status: 200 });
});

app.listen(process.env.PORT, () => {
  console.log("server is running");
});
