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

        console.log(`Verifying token: ${token}`);

        verifyToken(token, APP_SCRIPT_CLIENT_ID, (err) => {
            if (err) {
                res.status(401).send(err);
                console.log(`Error: ${err}`)
                return;
            }
            console.log('valid token!')
            // Token is valid, write the PDF
            streamPDFToGCS(req.body, (err, buffer) => {
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


function streamPDFToGCS(data, callback) {

    console.log(`Writing data ${JSON.stringify(data)} to PDF...`);

    const uuidv4 = require('uuid/v4');
    const name = uuidv4() + '.pdf';

    const Storage = require('@google-cloud/storage');
    const storage = new Storage();
    const bucket = storage.bucket(TARGET_BUCKET);
    const file = bucket.file(name);

    fs.readFile('dd1351.pdf', function(err, buff) {
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

// test code . . . 

exports.fillPDF = (filename) => {
    console.log('Testing all this');
    fields = {
        travel_order_auth_number: ['7357642'],
        'a DATERow3_2': ['07/19'],
        'house_hold_goodies': ['X'],
        'reason1': ['AT'],
        'a DATERow5_2': ['07/19'],
        'reason2': ['AT'],
        'reason3': ['TD'],
        'a DATERow7_2': ['07/21'],
        'a DATERow9_2': ['07/15'],
        'tdy': ['X'],
        'org_and_station': ['US CYBER JQ FFD11, MOFFETT FLD, CA '],
        'a DATERow1_2': ['07/15'],
        'ssn': ['111-22-3333'],
        'b NATURE OF EXPENSERow1': ['Travel from IAD to Hotel'],
        'b NATURE OF EXPENSERow3': ['Travel from BOS to Meeting'],
        'b NATURE OF EXPENSERow2': ['Travel from HOR to EWR'],
        'daytime_tel_num': ['732-575-0226'],
        'b NATURE OF EXPENSERow5': ['Travel from summit to BOS'],
        'b NATURE OF EXPENSERow4': ['Travel between meetings'],
        'from1': ['07/15'],
        'the_year': ['2018.0'],
        'b NATURE OF EXPENSERow7': ['Travel from hotel to IAD'],
        'to2': ['07/15'],
        'b NATURE OF EXPENSERow6': ['Travel from hotel to DCA'],
        'to1': ['07/15'],
        'b NATURE OF EXPENSERow9': ['Capital Bikeshare'],
        'from4': ['07/19'],
        'to4': ['07/19'],
        'b NATURE OF EXPENSERow8': ['Travel from EWR to HOR'],
        'to3': ['07/19'],
        'from5': ['07/21'],
        'from2': ['07/15'],
        'to6': ['07/21'],
        'from3': ['07/19'],
        'to5': ['07/21'],
        'reason4': ['TD'],
        'reason5': ['AT'],
        'from6': ['07/21'],
        'reason6': ['MC'],
        'zip': ['7090.0'],
        'c AMOUNTRow8': ['25.0'],
        'c AMOUNTRow7': ['45.46'],
        'c AMOUNTRow6': ['11.56'],
        'c AMOUNTRow5': ['38.86'],
        'c AMOUNTRow9': ['23.0'],
        'c STATE': ['NJ'],
        'a DATERow10_2': ['07/18'],
        'grade': ['O-5'],
        'c AMOUNTRow4': ['28.4'],
        'c AMOUNTRow3': ['21.1'],
        'c AMOUNTRow2': ['23.77'],
        'c AMOUNTRow1': ['43.5'],
        'mode6': ['CA'],
        'a DATERow2_2': ['07/15'],
        'mode5': ['CP'],
        'mode4': ['CP'],
        'a DATERow4_2': ['07/19'],
        'mode3': ['CP'],
        'ardep6': ['HOR'],
        'a DATERow6_2': ['07/19'],
        'a DATERow8_2': ['07/21'],
        'ardep1': ['EWR'],
        'd ALLOWEDRow10': ['6.25'],
        'ardep5': ['EWR'],
        'ardep4': ['Arlington VA'],
        'ardep3': ['BOS'],
        'ardep2': ['Arlington VA'],
        'e EMAIL ADDRESS': ['tbooher.guest@diux.mil'],
        'my_name': ['Tim Booher'],
        'address_and_street': ['200 E Dudley Ave'],
        'c AMOUNTRow10': ['6.25'],
        'mode2': ['CP'],
        'mode1': ['CA'],
        'b NATURE OF EXPENSERow10': ['Metro'],
        'eft': ['X'],
        'd ALLOWEDRow1': ['43.5'],
        'b CITY': ['Westfield'],
        'd ALLOWEDRow3': ['21.1'],
        'd ALLOWEDRow2': ['23.77'],
        'd ALLOWEDRow5': ['38.86'],
        'd ALLOWEDRow4': ['28.4'],
        'd ALLOWEDRow7': ['45.46'],
        'd ALLOWEDRow6': ['11.56'],
        'd ALLOWEDRow9': ['23.0'],
        'd ALLOWEDRow8': ['25.0']
    };

    fs.readFile(filename, function(err, data) {
        if (err) throw err;
        let pdf = pdf_form().transform(data, fields)
        fs.writeFile("dd1351.output.pdf", pdf, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    });
}