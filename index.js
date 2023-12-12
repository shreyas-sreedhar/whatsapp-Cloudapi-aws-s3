console.log("Hello from Indexjs");


const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const s3 = require("./s3"); //Adding the aws s3 connection file.

require('dotenv').config();

const sharp = require('sharp');

const app = express().use(body_parser.json());


const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;
const yourAuthToken = token;


//Remove "8080 ||" if you're hosting it in heroku or elsewhere

app.listen(8080 || process.env.PORT, () => {
    console.log("Website is Running");
});