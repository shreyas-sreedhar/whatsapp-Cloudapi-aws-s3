const {
    S3Client,
    PutObjectCommand
  } =require( "@aws-sdk/client-s3");

  
  require('dotenv').config();

  //Adding the passwords 
  let s3cli = new S3Client({
    credentials:{
        accessKeyId : process.env.S3_AccKEY, //Change access key from .env file 
        secretAccessKey : process.env.S3_SecAccKEY //Change Secret Access key from .env file 
    },
    region : "us-east-2"//Change region here
});

console.log("AWS S3 file loaded");


const upload = async (key,mimetype,bindata,wappid, typeoffile)=>{
    var folder = wappid;
    var subFolder = typeoffile;
    let putobj = new PutObjectCommand({
        Bucket: "shreyaswapi",  //Add your Bucket Name here 
        Key: `${folder}/${subFolder}/${key}`, //assigns media into separate folders according to the media type 
        Body: bindata,
        "ContentType"  :mimetype //Mediatype
      })
      
    try{
        await s3cli.send(putobj);
        console.log("In the putobj method");
    }
    catch(err){
        console.log(err);
    }
}

module.exports= {
upload
}
