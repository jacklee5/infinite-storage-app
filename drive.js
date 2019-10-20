var async = require('async');
const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Docs API.

    //Doc io
    authorize(JSON.parse(content), printDocTitle);
    authorize(JSON.parse(content), getFiles);

});
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

class Drive {
    constructor() {
        authorize(this.getFiles);
    }
    /**
     * Prints the title of a sample doc:
     * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
     * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
     */
    printDocTitle(auth) {
        const docs = google.docs({
            version: 'v1',
            auth
        });
        docs.documents.get({
            documentId: '195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            console.log(`The title of the document is: ${res.data.title}`);
        });
    }

    getFiles(auth) {
        // console.log("1");
        // const docs = google.drive({version: 'v3', auth});
        // docs.files.list({
        // }, function (err, response) {
        //     console.log("2");
        //     console.log(err);
        //     console.log(response);
        //    // TODO handle response
        // });

        // console.log("3");

        const drive = google.drive({
            version: 'v3',
            auth
        });
        const fileId = '1r-MQqFimUE4YuSezKg5-E7Zwy3QbT5Tt';
        drive.files.list({
            includeRemoved: false,
            spaces: 'drive',
            fileId: fileId,
            fields: 'nextPageToken, files(id, name, parents, mimeType, modifiedTime)',
            q: `'${fileId}' in parents`
        }, function (err, resp) {
            if (!err) {
                var i;
                console.log(resp.data.files);
                var files = resp.data.files;
                for (i = 0; i < files.length; i++) {
                    if (files[i].mimeType !== 'application/vnd.google-apps.folder') {
                        console.log('file: ' + files[i].name);
                    } else {
                        console.log('directory: ' + files[i].name);
                    }
                    console.log(files[i]);
                }
            } else {
                console.log('error: ', err);
            }
        });
    }
}
module.exports = Drive;