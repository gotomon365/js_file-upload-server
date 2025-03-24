const express = require('express');
const multer = require('multer');
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
    for (let iface in interfaces) {
        for (let address of interfaces[iface]) {
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
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js"></script>
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
                #file-list {
                    margin-top: 20px;
                }
                #qrcode {
                    margin-top: 20px;
                }
            </style>
            <script>
                function updateFileList() {
                    const input = document.querySelector('input[type="file"]');
                    const fileList = document.getElementById('file-list');
                    fileList.innerHTML = ''; // Clear the current list
                    for (const file of input.files) {
                        const listItem = document.createElement('li');
                        listItem.textContent = file.name;
                        fileList.appendChild(listItem);
                    }
                }

                $(document).ready(function() {
                    const ipAddress = "${ipAddress}:${PORT}";
                    $('#qrcode').qrcode(ipAddress);
                });
            </script>
        </head>
        <body>
            <h1>Upload Files</h1>
            <p>Connect to the server using the following IP address:</p>
            <h2>http://${ipAddress}:${PORT}/</h2>
            <div id="qrcode"></div> <!-- QR Code will be generated here -->
            <form action="/upload" method="post" enctype="multipart/form-data">
                <label class="custom-file-upload">
                    Choose Files
                    <input type="file" name="files" multiple required onchange="updateFileList()">
                </label>
                <button type="submit">Upload</button>
            </form>
            <ul id="file-list"></ul> <!-- List to display selected file names -->
        </body>
        </html>
    `);
});

// Handle multiple file uploads
app.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }
    const uploadedFiles = req.files.map(file => file.originalname).join(', ');
    res.send(`Files ${uploadedFiles} uploaded successfully!`);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
