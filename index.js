console.log("Hello from Indexjs");

const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
const fs = require("fs");

require('dotenv').config();
const s3 = require("./s3");
const sharp = require('sharp');
const stream = require('stream');

const app = express().use(body_parser.json());


const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;
const yourAuthToken = token;

app.listen(8080 || process.env.PORT, () => {
    console.log("webhook is listening");
});