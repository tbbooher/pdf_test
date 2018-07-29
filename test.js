let fs = require("fs");
let pdf_form = require('pdfform.js');

// get the form fields
fs.readFile('sap6.pdf', function(err, data) {
    if (err) throw err;
    console.log(pdf_form().list_fields(data));
});

// some good stuff I used:
// http://pdfjs.rkusa.st/
// https://mozilla.github.io/pdf.js/examples/
// https://www.npmjs.com/package/pdfform.js
// https://stackoverflow.com/questions/24944404/fill-pdf-form-with-javascript-client-side-only
// https://github.com/GoogleCloudPlatform/nodejs-docker/edit/master/runtime-image/Dockerfile
// https://medium.freecodecamp.org/use-google-sheets-and-google-apps-script-to-build-a-blog-cms-c2eab3fb0b2b
// https://github.com/jjwilly16/node-pdftk
// https://docs.google.com/document/d/1rgYSmkyEsrYgbidIneQ63Hyt-LXN9cBIKiQ_THiYNTw/edit#heading=h.9f5w2gz8x13g
// https://cloud.google.com/docs/tutorials#architecture
// 

// now set the field
function fields() {
    personal_data = {
        'my_name': ['Tim Booher'],
        'grade': ['O-5'],
        'ssn': ['111-22-2222'],
        'address_and_street': ['200 E Dudley Ave'],
        'b CITY': ['Westfield'],
        'c STATE': ['NJ'],
        'daytime_tel_num': ['732-575-0226'],
        'travel_order_auth_number': ['7357642'],
        'org_and_station': ['US CYBER JQ FFD11, MOFFETT FLD, CA'],
        'e EMAIL ADDRESS': ['tbooher.guest@diux.mil'],
        'eft': ['X'],
        'tdy': ['X'],
        'house_hold_goodies': ['X'],
        'the_year': ['2018']
    }
    trip_data = { 'a DATERow3_2': ['07/19'], 'reason1': ['AT'], 'a DATERow5_2': ['07/19'], 'reason2': ['AT'], 'reason3': ['TD'], 'a DATERow7_2': ['07/21'], 'a DATERow9_2': ['07/15'], 'b NATURE OF EXPENSERow81': ['Capital Bikeshare'], 'a DATERow1_2': ['07/15'], 'b NATURE OF EXPENSERow41': ['Travel from summit to BOS'], 'b NATURE OF EXPENSERow1': ['Travel from IAD to Hotel'], 'from1': ['07/15'], 'to2': ['07/15'], 'to1': ['07/15'], 'from4': ['07/19'], 'to4': ['07/19'], 'to3': ['07/19'], 'from5': ['07/21'], 'from2': ['07/15'], 'to6': ['07/21'], 'from3': ['07/19'], 'to5': ['07/21'], 'reason4': ['TD'], 'reason5': ['AT'], 'from6': ['07/21'], 'reason6': ['MC'], 'c AMOUNTRow8': ['25.0'], 'c AMOUNTRow7': ['45.46'], 'c AMOUNTRow6': ['11.56'], 'c AMOUNTRow5': ['38.86'], 'c AMOUNTRow9': ['23.0'], 'b NATURE OF EXPENSERow7': ['Travel from EWR to HOR'], 'b NATURE OF EXPENSERow3': ['Travel between meetings'], 'a DATERow10_2': ['07/18'], 'c AMOUNTRow4': ['28.4'], 'c AMOUNTRow3': ['21.1'], 'c AMOUNTRow2': ['23.77'], 'c AMOUNTRow1': ['43.5'], 'mode6': ['CA'], 'a DATERow2_2': ['07/15'], 'mode5': ['CP'], 'mode4': ['CP'], 'a DATERow4_2': ['07/19'], 'mode3': ['CP'], 'ardep6': ['HOR'], 'a DATERow6_2': ['07/19'], 'a DATERow8_2': ['07/21'], 'b NATURE OF EXPENSERow6': ['Travel from hotel to IAD'], 'ardep1': ['EWR'], 'd ALLOWEDRow10': ['6.25'], 'b NATURE OF EXPENSERow2': ['Travel from BOS to Meeting'], 'ardep5': ['EWR'], 'ardep4': ['Arlington VA'], 'ardep3': ['BOS'], 'ardep2': ['Arlington VA'], 'c AMOUNTRow10': ['6.25'], 'mode2': ['CP'], 'mode1': ['CA'], 'b NATURE OF EXPENSERow9': ['Metro'], 'b NATURE OF EXPENSERow5': ['Travel from hotel to DCA'], 'd ALLOWEDRow1': ['43.5'], 'b NATURE OF EXPENSERow1': ['Travel from HOR to EWR'], 'd ALLOWEDRow3': ['21.1'], 'd ALLOWEDRow2': ['23.77'], 'd ALLOWEDRow5': ['38.86'], 'd ALLOWEDRow4': ['28.4'], 'd ALLOWEDRow7': ['45.46'], 'd ALLOWEDRow6': ['11.56'], 'd ALLOWEDRow9': ['23.0'], 'd ALLOWEDRow8': ['25.0'] }
    return Object.assign({}, personal_data, trip_data);
}

function GeneratePDF(filename, fields) {
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

//GeneratePDF('dd1351_c.pdf', fields())