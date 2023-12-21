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


//Remove "8080 ||" if you're hosting it in heroku or elsewhere

app.listen(8080 || process.env.PORT, () => {
    console.log("Website is Running");
});


//To Verify if through GET is working - Needed for FB to verify if /webhook works 
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let challange = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];
    if (mode && token) {
        if (mode === "subscribe" && token === mytoken) {
            res.status(200).send(challange);
        } else {
            res.status(403);
        }
    }
});

// webhook through POST

app.post("/webhook", (req, res) => {

    let body_content = req.body;

    // console.log(JSON.stringify(body_content, null, 2));


    //Conditional statement to check if the body_content (the request body) contains an object property.
    if (body_content.object) {
        console.log("Body has an Object and is Inside it");

        //Getting the Whatsapp senders ID
        let wappid = body_content.entry[0].changes[0].value.contacts[0].wa_id;

        let messages = body_content.entry[0].changes[0].value.messages;

        // Iterate through messages array
        for (let i = 0; i < messages.length; i++) {
            let message = messages[i];

            // Check if the message type is "image"
            if (message.type === "image") {
                let imageInfo = message.image;

                // Accessing the type of media send and image id
                let mime_type = imageInfo.mime_type;
                let id = imageInfo.id;
                console.log("mime_type:", mime_type);
                console.log("id:", id);

                //sending a request to GraphAPI with Image Id and Whatsapp Sender ID
                sendGetRequest(id, wappid)
            }
            //Check if the message type is "Video"
            else if (message.type === "video") {
                let imageInfo = message.video;


                let mime_type = imageInfo.mime_type;
                let id = imageInfo.id;


                console.log("mime_type:", mime_type);
                console.log("id:", id);
                //sending a request to GraphAPI with Video Id and Whatsapp Sender ID
                sendGetRequest(id, wappid)
            }
        }

        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }



});

async function sendGetRequest(id, wappid) {
    newurl = "https://graph.facebook.com/v18.0/" + id;
    try {
        const response = await axios.get(newurl, {
            headers: {
                "Authorization": "Bearer " + token // Add your Token to the header of the API request
            }
        })
        // console.log(response) if you want to see the response you get. 

        if (response.data && response.data.url) {

            //Get the Image Url
            const mediaURL = response.data.url;
            //Get the Image type, need it for saving in AWS S3

            const mediaMimeType = response.data.mime_type;

            console.log(" Response from Graph V.18 - image: " + mediaURL);
            console.log(" Mime type: " + mediaMimeType);

            sendImgDownload(mediaURL, mediaMimeType, wappid, id);



        } else {
            console.log("Unexpected response format:", response.data);
        }
    } catch (error) {
        console.error('Error saving image from sendgetrequest:', error.message);
    }
}

async function sendImgDownload(mediaURL, mediaMimeType, wappid, id) {
    filename = `WA_${id}`;
    let data = '';
    try {
        const response = await axios.get(mediaURL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': mediaMimeType,
            },
            responseType: 'arraybuffer', // This is important for binary data
        });

        // Check if the response contains data
        if (response.data) {

            // Splitting the mimetype to save in AWS

            if (mediaMimeType.startsWith("image/")) {
                file_extension = filename + "." + mediaMimeType.split('/')[1]
                typeoffile = mediaMimeType.split('/')[0]
                
                somedata = Buffer.from(response.data, 'binary')
                // Save the binary data to a variable

                //Sending it to aws
                sendtoaws(file_extension, mediaMimeType, somedata, wappid, typeoffile);

                await fs.writeFileSync(file_extension, Buffer.from(response.data, 'binary'));

                console.log(`Media saved to ${file_extension} successfully.`);

            } else if (mediaMimeType.startsWith("video/")) {
                file_extension = filename + "." + mediaMimeType.split('/')[1]
                typeoffile = mediaMimeType.split('/')[0]
                
                somedata = Buffer.from(response.data, 'binary')

                // Save the binary data to a file
                sendtoaws(file_extension, mediaMimeType, somedata, wappid, typeoffile);
                await fs.writeFileSync(file_extension, Buffer.from(response.data, 'binary'));
                console.log(`Media saved to ${file_extension} successfully.`);
            }
        } else {
            console.error('Empty response data received.');
        }
    } catch (error) {
        console.error('Error sending to AWS:', error.message);
    }
}

async function sendtoaws(file_extension, mediaMimeType, somedata, wappid, typeoffile) {
    //Uploading stuff to the S3 bucket
    await s3.upload(file_extension, mediaMimeType, somedata, wappid, typeoffile);
    console.log("Image uploaded to AWS S3 successfully");
    
}