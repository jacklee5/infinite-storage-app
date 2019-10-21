var async = require('async');
const fs = require('fs');
const readline = require('readline');
const moment = require("moment");
const {
    google
} = require('googleapis');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, ...args) {
    return new Promise((res, rej) => {
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
            res(callback(oAuth2Client, ...args));
        });
    })
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
        this.credentials;
        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Docs API.

            //Doc io
            const credentials = JSON.parse(content);
            this.credentials = credentials;
        });
    }
    /**
     * Prints the title of a sample doc:
     * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
     * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
     */

    readFile(id){
        authorize(this.credentials, (auth) => {
            const drive = google.drive({
                version: 'v3',
                auth
            });
            drive.files.export({
                'fileId' : id,
                'mimeType' : 'text/plain',
            }).then(function(success){
                console.log(success.data);
                return success.data;
                //success.result    
            }, function(fail){
                console.log(fail);
                console.log('Error '+ fail.result.error.message);
            })
        })
    }

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

    getFiles(auth, folderId) {
        return new Promise((res, rej) => {
            const drive = google.drive({
                version: 'v3',
                auth
            });
            const fileId = folderId;
            drive.files.list({
                includeRemoved: false,
                spaces: 'drive',
                fileId: fileId,
                fields: 'nextPageToken, files(id, name, parents, mimeType, modifiedTime)',
                q: `'${fileId}' in parents and trashed = false`
            }, function (err, resp) {
                if (!err) {
                    var i;
                    res(resp.data.files);
                } else {
                    rej(err);
                }
            });
        })
    }
    getUser(userId) {
        return new Promise((res, rej) => {
            authorize(this.credentials, this.getFiles, "16Odad93Eb-xIsZPIbDXaESJBMv5vI-fX")
                .then(files => {
                    //date is in rfc 3339
                    //name, date, type, id
                    let found = false;
                    this.readFile('1Bqb_b0pOm_D7EO6SIQ7hqqAv3EJTTkJOTgru7ddp6Ew');
                    for (let i = 0; i < files.length; i++) {
                        if (files[i].name === userId + "") {
                            found = true;
                            authorize(this.credentials, this.getFiles, files[i].id)
                                .then(data => {
                                    res(data.map(x => {
                                        return {
                                            id: x.id,
                                            name: x.name,
                                            date: moment(x.modifiedTime, "YYYY-MM-DDTHH:mm:ssZ").fromNow(),
                                            type: "TODO"
                                        }
                                    }));
                                })
                        }
                    }
                    if(!found)
                        res([]);
                });
        })
    }
}
module.exports = Drive;