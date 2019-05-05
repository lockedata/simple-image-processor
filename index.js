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
