require('dotenv').load();

const path = require('path');
const fs = require('fs');
const https = require('https');

const storage = require('azure-storage');
const blobService = storage.createBlobService();

const downloadImage = (url, localPath) => {
    return new Promise((resolve, reject) => {
        let file = fs.createWriteStream(localPath);
        https.get(url, function(response, err) {
            if(err) {
                reject();
            }

            response.pipe(file);
            resolve();
        });
    })
}

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
            let url = 'https://www.bmw.com.au/content/dam/bmw/marketAU/bmw_com_au/all-models-new/1-series/navigation/BMW-1-Series%205-door_Modelcard.png?format=png&name=bmw6' // req.query.imageurl;
            const fileFormat = url.substring(url.indexOf('format=') + 7, url.indexOf('&name'));
            const imagePath = `./${url.substring(url.indexOf('name=') + 5)}.${fileFormat}`;
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
