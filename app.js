const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = 8887;

// Set the upload folder and configure multer
const UPLOAD_FOLDER = 'uploads';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Create the upload folder if it doesn't exist
if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER);
}

// Function to get the local IP address
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (let interface in interfaces) {
        for (let address of interfaces[interface]) {
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
    return 'localhost';
}

// Serve the HTML form
app.get('/', (req, res) => {
    const ipAddress = getLocalIp();
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Upload</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                input[type="file"] {
                    display: none; /* Hide the default file input */
                }
                .custom-file-upload {
                    display: inline-block;
                    padding: 10px 20px;
                    cursor: pointer;
                    border: 1px solid #ccc;
                    background-color: #f0f0f0;
                    border-radius: 5px;
                    margin-right: 10px;
                }
                button {
                    padding: 10px 20px;
                    border: none;
                    background-color: #4CAF50;
                    color: white;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
            </style>
        </head>
        <body>
            <h1>Upload a File</h1>
            <p>Connect to the server using the following IP address:</p>
            <h2>http://${ipAddress}:${PORT}/</h2>
            <form action="/upload" method="post" enctype="multipart/form-data">
                <label class="custom-file-upload">
                    Choose File
                    <input type="file" name="file" required>
                </label>
                <button type="submit">Upload</button>
            </form>
        </body>
        </html>
    `);
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send(`File ${req.file.originalname} uploaded successfully!`);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://<your-server-ip>:${PORT}`);
});
