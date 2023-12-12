const {
    S3Client,
    PutObjectCommand
  } =require( "@aws-sdk/client-s3");

  //Adding the passwords 
  let s3cli = new S3Client({
    credentials:{
        accessKeyId : process.env.S3_AKEY,
        secretAccessKey : process.env.S3_SAKEY
    },
    region : "us-east-2" //Choose your region
});

console.log("In the aws-s3 file");


const upload = async (key,mimetype,bindata,waId, typeoffile)=>{
    var folder = waId;
    var subFolder = typeoffile;
    let putobj = new PutObjectCommand({
        Bucket: "shreyas-b1",
        Key: `${folder}/${subFolder}/${key}`, //assigns media into separate folders according to the media type 
        Body: bindata,
        "ContentType"  :mimetype //Mediatype
      })
      
    try{
        await s3cli.send(putobj);
        console.log("in send putobj method");
    }
    catch(err){
        console.log(err);
    }
}

module.exports= {
upload
}
