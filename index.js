const request = require('request');

const path = require('path');

const fs = require('fs'); // maybe

const pdf_form = require('pdfform.js');

// The URL we need to call to validate the oauth token
const GOOGLE_OAUTH_URL = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="

// The client ID of the App Script that requested the oauth token
const APP_SCRIPT_CLIENT_ID = process.env.APP_SCRIPT_CLIENT_ID;

// The bucket we'll write the PDF file to
const TARGET_BUCKET = process.env.TARGET_BUCKET;

// helpful links:
// https://stackoverflow.com/questions/36535153/uploading-a-buffer-to-google-cloud-storage
// https://github.com/phihag/pdfform.js/blob/master/pdfform.js
// https://docs.nodejitsu.com/articles/advanced/streams/how-to-use-stream-pipe/
// https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/File#createWriteStream

// the actual cloud function
exports.writeToPDF = (req, res) => {

    // Authorization: Bearer access_token
    let authHeader = req.headers.authorization;
    if (authHeader) {
        let token = authHeader.split(' ')[1];

        let data = req.body;

        let file_name = `${data['file_name']}.pdf`;

        console.log(`Verifying token: ${token}`);

        verifyToken(token, APP_SCRIPT_CLIENT_ID, (err) => {
            if (err) {
                res.status(401).send(err);
                console.log(`Error: ${err}`)
                return;
            }
            console.log('valid token!')
            // Token is valid, write the PDF
            streamPDFToGCS(file_name, data, (err, buffer) => {
                if (err) {
                    console.error(err);
                    res.status(500).send(err);
                    return;
                }
                console.log('success:')
                res.type('application/pdf'); // If you omit this line, file will download
                res.send(buffer);
            });
        });
    } else {
        res.status(401).send('Not authorized');
    }
}


function streamPDFToGCS(file_name, data, callback) {

    console.log(`Writing data ${JSON.stringify(data)} to PDF...`);

    const uuidv4 = require('uuid/v4');
    const name = uuidv4() + '.pdf';

    const Storage = require('@google-cloud/storage');
    const storage = new Storage();
    const bucket = storage.bucket(TARGET_BUCKET);
    const file = bucket.file(name);

    fs.readFile(file_name, function(err, buff) {
        if (err) throw err;
        pdf = pdf_form().transform(buff, data)
        console.log('-------- transform successful --------')
        const stream = file.createWriteStream({
            metadata: {
                contentType: 'application/pdf'
            },
            resumable: false
        });

        stream.on('error', (err) => {
            callback(err);
            return;
        });

        stream.on('finish', () => {
            file.getSignedUrl({
                action: 'read',
                expires: Date.now() + (60 * 60 * 1000) // 1 hour
            }).then((response) => {
                callback(null, response[0]);
            }).catch((err) => {
                callback(err);
            });
        });

        stream.end(pdf);
    });

}

function verifyToken(token, audience, callback) {

    console.log(`Calling token validation url ${GOOGLE_OAUTH_URL+token}`);

    request(GOOGLE_OAUTH_URL + token, { json: true }, (err, response, body) => {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }

        if (response.statusCode !== 200) {
            callback(body.error);
            return;
        }

        // Check the expiry
        if (body.expires_in <= 0) {
            callback('Token Expired');
            return;
        }

        // Check the audience
        if (body.audience !== audience) {
            console.log(`Token audience ${body.audience} did not match required audience ${audience}`)
            callback('Invalid Token');
            return;
        }

        callback(null, body);
    });
}