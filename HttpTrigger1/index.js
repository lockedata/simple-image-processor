require('dotenv').load();

const path = require('path');
const fs = require('fs');
const axios = require('axios');

const storage = require('azure-storage');
const blobService = storage.createBlobService();
const sleep = require('system-sleep');

const downloadImage = (url, localPath) => axios({
    url: url,
    responseType: 'stream',
}).then(response => {
    response.data.pipe(fs.createWriteStream(localPath));
    sleep(2000);
});

const uploadLocalFile = (containerName, filePath) => {
    return new Promise((resolve, reject) => {
        const fullPath = path.resolve(filePath);
        const blobName = path.basename(filePath);
        blobService.createBlockBlobFromLocalFile(containerName, blobName, fullPath, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Local file "${filePath}" is uploaded` });
            }
        });
    });
};

const deleteLocalFile = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.unlink(fileName, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    })
}

module.exports = async function (context, req) {
    try {
        context.log('JavaScript HTTP trigger function started to process a request.');

        if (req.query.imageurl) {
            let url = req.query.imageurl;
            const fileFormat = url.substring(url.indexOf('format=') + 7);
            const imagePath = `./${req.query.name}.${fileFormat}`;
            await downloadImage(req.query.imageurl, imagePath);
            await uploadLocalFile('samples', imagePath);
            await deleteLocalFile(imagePath);
            context.res = {
                body: `${imagePath} added to blob`
            };
        }
        else {
            context.res = {
                status: 400,
                body: "Please pass the image url parameter in query"
            };
        }        
    }
    catch(err) {
        context.res = {
            status: 500,
            body: `Internal error: ${err.message}`
        };
    }
};
