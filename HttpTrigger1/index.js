module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger functionnnnnnnnnnnnn processed a request.');

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query stringggggggggggg or in the request body"
        };
    }
};

require('dotenv').load();
const path = require('path');

const storage = require('azure-storage');
const blobService = storage.createBlobService();

const uploadLocalFile = async (containerName, filePath) => {
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

const execute = async () => {
    try {
        const response = await uploadLocalFile('samples', '.README.md');
        console.log(response.message);
    } catch(err) {
        console.log(err);
    }
}
    // response = await uploadLocalFile("samples", localFilePath);

execute().then(() => console.log("Done")).catch((e) => console.log(e));
