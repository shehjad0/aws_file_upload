import AWS from "aws-sdk";
import {Constants} from "./constants";
import {successAlert, errorAlert} from "./alert";

const config = {
    bucketName: Constants.S3_BUCKET_NAME,
    dirName: Constants.S3_DIR_NAME, /* optional */
    region: Constants.S3_REGION,
    accessKeyId: Constants.S3_ACCESS_KEY_ID,
    secretAccessKey: Constants.S3_ACCESS_KEY_SECRET
};

export const uploadVideo = async (file, directory = null, setUploading, callback) => {
    const fileName = Constants.S3_FILE_NAME(file.name);

    AWS.config.update({
        accessKeyId: Constants.S3_ACCESS_KEY_ID,
        secretAccessKey: Constants.S3_ACCESS_KEY_SECRET,
        region: Constants.S3_REGION
    });

    const myBucket = new AWS.S3();

    const params = {
        ACL: 'public-read',
        Bucket: Constants.S3_BUCKET_NAME,
        Key: `${directory}/${fileName}`,
        ContentType: file.type,
        Body: file,
    };

    let reader = new FileReader();
    reader.onloadend = () => {
        let media = new Audio(reader.result);
        media.onloadedmetadata = async () => {
            setUploading(0);
            await myBucket.upload(params, async (err, res) => {
                if (err) {
                    errorAlert({title: "Something went wrong"})
                } else callback({...res, duration: parseInt(media.duration)})
            }).on('httpUploadProgress', (evt) => setUploading(Math.round((evt.loaded / evt.total) * 100)));
        }
    };
    reader.readAsDataURL(file);
}

export const uploadPhoto = async (file, directory, setUploading, callback) => {
    const fileName = Constants.S3_FILE_NAME(file.name);

    AWS.config.update({
        accessKeyId: Constants.S3_ACCESS_KEY_ID,
        secretAccessKey: Constants.S3_ACCESS_KEY_SECRET,
        region: Constants.S3_REGION
    });

    const myBucket = new AWS.S3();

    const params = {
        ACL: 'public-read',
        Bucket: Constants.S3_BUCKET_NAME,
        Key: `${directory}/${fileName}`,
        ContentType: file.type,
        Body: file,
    };

    await setUploading(0);
    await myBucket.upload(params, async (err, res) => {
        if (err) {
            errorAlert({title: "Something went wrong"})
        } else callback(res)
    }).on('httpUploadProgress', (evt) => setUploading(Math.round((evt.loaded / evt.total) * 100)));
}

export const uploadBase64 = async (base64String, fileName, directory, setUploading, callback) => {
    AWS.config.update({
        accessKeyId: Constants.S3_ACCESS_KEY_ID,
        secretAccessKey: Constants.S3_ACCESS_KEY_SECRET,
        region: Constants.S3_REGION
    });

    const base64Data = new Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = base64String.split(';')[0].split('/')[1];
    const myBucket = new AWS.S3();

    const params = {
        ACL: 'public-read',
        Bucket: Constants.S3_BUCKET_NAME,
        Key: `${directory}/${fileName}`,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
    };

    await setUploading(0);
    await myBucket.upload(params, async (err, res) => {
        if (err) {
            errorAlert({title: "Something went wrong"})
        } else callback(res)
    }).on('httpUploadProgress', (evt) => setUploading(Math.round((evt.loaded / evt.total) * 100)));
}


export const deleteFile = ((key, callback) => {
    AWS.config.update({
        accessKeyId: Constants.S3_ACCESS_KEY_ID,
        secretAccessKey: Constants.S3_ACCESS_KEY_SECRET,
        region: Constants.S3_REGION
    });

    const myBucket = new AWS.S3();

    let params = {
        Bucket: Constants.S3_BUCKET_NAME,
        Key: key
    };

    myBucket.deleteObject(params, function(err, data) {
        if (err) {
            console.log(err)
        } else callback(data)
    });
})
