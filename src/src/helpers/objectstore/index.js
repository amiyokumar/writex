//import { Injectable } from '@nestjs/common';
//import * as Minio from 'minio';
// const BUCKET_NAME = 'writex';
const Minio = require('minio');
const fs = require('fs');
const objectStoreHelper = {};
const path = require('path');
const os = require('os');
const downloadsFolder = require('downloads-folder');
// @Injectable()
// export class FilesService {

const BUCKET_NAME = process.env.E2E_BUCKET_NAME;

minioClient = new Minio.Client({
  endPoint: process.env.E2E_ENDPOINT,
  useSSL: true,
  accessKey: process.env.E2E_ACCESS_KEY,
  secretKey: process.env.E2E_SECRET_KEY,
});

//   constructor() {
//   }

// Function to upload a file to object storage
// async function uploadFileToStorage(file,folderName) {
//     const objectStorageEndpoint = 'https://your-object-storage-endpoint.com'; // Replace with your object storage endpoint
//     const bucketName = 'your-bucket-name'; // Replace with your bucket name

//     // Prepare the file data
//     const formData = new FormData();
//     formData.append('file', file);

//     // Make a POST request to upload the file
//     try {
//       const response = await fetch(`${objectStorageEndpoint}/buckets/${bucketName}/objects`, {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         console.log('File uploaded successfully');
//       } else {
//         console.error('Failed to upload file:', response.statusText);
//       }
//     } catch (error) {
//       console.error('Error uploading file:', error);
//     }
//   }

//   // Function to fetch and read a file from object storage
//   async function readFileFromStorage(filename) {
//     const objectStorageEndpoint = 'https://your-object-storage-endpoint.com'; // Replace with your object storage endpoint
//     const bucketName = 'your-bucket-name'; // Replace with your bucket name

//     // Make a GET request to fetch the file
//     try {
//       const response = await fetch(`${objectStorageEndpoint}/buckets/${bucketName}/objects/${filename}`);

//       if (response.ok) {
//         const fileData = await response.text();
//         console.log('File content:', fileData);
//       } else {
//         console.error('Failed to fetch file:', response.statusText);
//       }
//     } catch (error) {
//       console.error('Error fetching file:', error);
//     }
//   }

//   // Usage example:
//   const fileToUpload = new File(['Hello, Object Storage!'], 'example.txt', { type: 'text/plain' });

//   // Upload the file to object storage
//   uploadFileToStorage(fileToUpload);

//   // Read the file from object storage
//   readFileFromStorage('example.txt');

// Configure the Minio client with your endpoint, accessKey, and secretKey
// const endPoint = 'your-endpoint-url'; // Replace with your object storage endpoint URL
// const accessKey = 'your-access-key';     // Replace with your access key
// const secretKey = 'your-secret-key';     // Replace with your secret key

// const minioClient = new Minio.Client({
//   endPoint,
//   accessKey,
//   secretKey,
//   secure: false, // Set to true if you're using HTTPS
// });

// Define the name of your bucket and the file name
//const bucketName = 'your-bucket-name';
//const fileName = 'example.txt'; // Replace with your desired file name

// Upload a file to the object storage
// const uploadParams = {
//     Bucket: bucketName,
//     Key: fileName,
//     Body: fs.createReadStream('path/to/local/file.txt'), // Replace with the path to your local file
// };

objectStoreHelper.uploadFile = function (filePath, fileName, ticketId) {
  console.log('File Path in Blob store ', filePath);
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fs.createReadStream(filePath),
  };

  const dataBuffer = fs.createReadStream(filePath);

  minioClient.putObject(BUCKET_NAME, fileName, dataBuffer, (err) => {
    if (err) {
      console.error('Error uploading file:', err);
    } else {
      console.log('File uploaded successfully');
    }
  });
};

// Function to read a file from the object storage
objectStoreHelper.readFile = function (fileName) {
  // Read the uploaded file from the object storage
  minioClient.getObject(BUCKET_NAME, fileName, (err, dataStream) => {
    if (err) {
      console.error('Error reading file from object storage:', err);
    } else {
      let data = '';
      dataStream.on('data', (chunk) => {
        data += chunk;
      });

      dataStream.on('end', () => {
        console.log('File content:', data);
      });
    }
  });
};

objectStoreHelper.downloadFile = function (objectName, callback) {
  const savePath = path.join(__dirname, '../../../public/uploads/tickets/', objectName);
  minioClient.fGetObject(BUCKET_NAME, objectName, savePath, function (err) {
    // console.log('CP1');
    if (err) {
      // console.log('CP2');
      console.error('Error downloading object:', err);
      callback(err);
    } else {
      // console.log('CP3');
      console.log(`Object "${objectName}" downloaded successfully"`);
      //callback(null);
    }
  });
};

// objectStoreHelper.downloadFile = function (objectName, res) {
//   // Generate a pre-signed URL for the object
//   minioClient.presignedGetObject(BUCKET_NAME, objectName, 24 * 60 * 60, (err, url) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     console.log('URL ', url);
//     return url;
//   });
// };

objectStoreHelper.handleReadData = function (objectName, res) {
  const clientFilePath = path.join(downloadsFolder(), objectName);
  // console.log('SAVE PATH ', clientFilePath);
  console.log('DOWNLOADS PATH ', downloadsFolder());
  // Set headers to suggest a download and specify the filename
  // res.setHeader('Content-Disposition', `attachment; filename="${objectName}"`);
  minioClient.fGetObject(BUCKET_NAME, objectName, clientFilePath, function (err) {
    if (err) {
      console.error('Error streaming MinIO object:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(`File saved to ${clientFilePath}`);
      res.json({ clientPath: clientFilePath });
      //callback(null);
    }
  });
};

// minioClient.putObject(uploadParams, (err) => {
//     if (err) {
//         console.error('Error uploading file:', err);
//     } else {
//         console.log('File uploaded successfully');
//     }

//     // Read the uploaded file from the object storage
//     minioClient.getObject(bucketName, fileName, (err, dataStream) => {
//         if (err) {
//             console.error('Error reading file from object storage:', err);
//         } else {
//             let data = '';
//             dataStream.on('data', (chunk) => {
//                 data += chunk;
//             });

//             dataStream.on('end', () => {
//                 console.log('File content:', data);
//             });
//         }
//     });
// }
// );

objectStoreHelper.removeFile = function (objectName, callback) {
  minioClient.removeObject(BUCKET_NAME, objectName, function (err) {
    if (err) {
      console.error('Error removing object:', err);
      callback(err);
    } else {
      console.log(`Object "${objectName}" removed successfully from bucket "`);
      // callback(null);
    }
  });
};

function getDownloadsPath() {
  const homeDir = os.homedir();

  switch (process.platform) {
    case 'win32':
      return path.join(homeDir, 'Downloads');
    case 'darwin':
      return path.join(homeDir, 'Downloads');
    case 'linux':
      return path.join(homeDir, 'Downloads');
    default:
      console.error('Unsupported platform');
      return null;
  }
}

module.exports = objectStoreHelper;
