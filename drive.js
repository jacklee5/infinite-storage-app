
var async = require('async');
const fs = require('fs');
const readline = require('readline');
const moment = require("moment");
const path = require("path");
const mkdirp = require("mkdirp");
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
        const content = fs.readFileSync('credentials.json');
        const credentials = JSON.parse(content);
        this.credentials = credentials;
    }
    /**
     * Prints the title of a sample doc:
     * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
     * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
     */

    fileRead(id) {
        return new Promise((res, rej) => {
            //authorizes the reading of a file in hihi drive
            authorize(this.credentials, (auth) => {
                //create drive object with authentification
                const drive = google.drive({
                    version: 'v3',
                    auth
                });
                
                //gets file content
                drive.files.export({
                    'fileId': id,
                    'mimeType': 'text/plain',
                }, (err, response) => {
                    if(err) {
                        console.log(err);
                        setTimeout( () => {
                            console.log(y);
                            console.log("retrying");
                            res(this.fileRead(id));
                        }, 2000);
                    };
                    res(response.data);
                })
            })
        });
    }

    fileWrite(title, data, folder) {
        return new Promise((res, rej) => {
            //authorizes the writing of a file in hihi drive
            authorize(this.credentials, (auth) => {
                //create drive object with authentification
                const drive = google.drive({
                    version: 'v3',
                    auth
                });
                //creates the file
                drive.files.create({
                    //metadata
                    requestBody: {
                        name: title,
                        mimeType: 'application/vnd.google-apps.document',
                        parents: [folder]
                    },
                    //content
                    media: {
                        mimeType: 'text/plain',
                        body: data
                    }
                }, (err, response) => {
                    if(err) {
                        console.error("error: " + err);
                        rej({title: title, data: data, folder: folder});
                    }
                    res(true);
                })
            })
        })
    }

    fileDelete(id) {
        return new Promise((res, rej) => {
            authorize(this.credentials, (auth) => {
                //create drive object with authentification
                const drive = google.drive({
                    version: 'v3',
                    auth
                });
                //deletes the file
                drive.files.delete({
                    'fileId': id
                })
            })
        });
    }

    createFolder(title, parent) {
        return new Promise((res, rej) => {
            authorize(this.credentials, (auth) => {
                //create drive object with authentification
                const drive = google.drive({
                    version: 'v3',
                    auth
                });

                //create metadata of folder
                var fileMetadata = {
                    name: title,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [parent]
                }

                //create file
                drive.files.create({
                    resource: fileMetadata,
                    fields: 'id'
                }, null, (err, response) => {
                    if(err)
                        rej(err);
                    else
                        res(response);
                });
            })
        })
    }

    //splits a string into sets of 100000 characters
    splitData(data) {
        const part_length = 100000;
        var folder_size = Math.ceil(data.length / part_length);
        var split_data = [];
        for (let i = 0; i < folder_size - 1; i++) {
            split_data.push(data.substring(i * part_length, (i + 1) * part_length));
        }
        split_data.push(data.substring((folder_size - 1) * part_length));
        return split_data;
    }

    //combines the content of a list of documents
    combineData(ids) {
        var data = "";
        for (let i = 0; i < ids.length; i++) {
            data += fileRead(ids[i]);
        }
        return data;
    }

    //test for authentification - prints title of a test document
    printDocTitle(id) {
        return new Promise((res, rej) => {
            //authorizes the reading of a file in hihi drive
            authorize(this.credentials, (auth) => {
                //create drive object with authentification
                const drive = google.drive({
                    version: 'v3',
                    auth
                });
                //gets file content
                drive.files.get({
                    'fileId': id,
                    'mimeType': 'application/vnd.google-apps.folder',
                }, (err, response) => {
                    if(err) rej(err);
                    res(response.data.name);
                })
            })
        });
    }

    //returns all files in folder of folderId
    getFiles(auth, folderId) {
        return new Promise((res, rej) => {
            //create drive object with authentification
            const drive = google.drive({
                version: 'v3',
                auth
            });
            const fileId = folderId;
            //lists everything in the folder
            drive.files.list({
                //criteria for things to search for
                includeRemoved: false,
                spaces: 'drive',
                fileId: fileId,
                fields: 'nextPageToken, files(id, name, parents, mimeType, modifiedTime)',
                q: `'${fileId}' in parents and trashed = false`
            }, function (err, resp) {
                //return errors
                if (!err) {
                    var i;
                    res(resp.data.files);
                } else {
                    rej(err);
                }
            });
        })
    }

    readFolder(auth, folderId) {
        return new Promise((res, rej) => {
            authorize(this.credentials, this.getFiles, folderId)
                .then(files => {
                    var full = "";
                    //sort files in folder by name
                    files.sort((a, b) => {
                        return Number(a.name) - Number(b.name);
                    })
                    //reads all of the files
                    var requestQueue = [] //queue for requests, store this.fileread requests
                    Promise.all(files.map((x, i) => {
                        console.log(x.name);
                        requestQueue.push([this.fileRead, x, i])
                    }))
                     // return new Promise((res, rej) => {
                        //     setTimeout(() => {
                        //         this.fileRead(x.id)
                        //         .then(d => {
                        //             res(d);
                        //         });
                        //     }, i * 500);
                        // });

                    // .then(values => {
                    //     for(let i = 0; i < files.length; i++){
                    //         full += values[i].substring(1);
                    //     }
                    //     res(full);
                    // })
                    // while(requestQueue.length > 0){
                        
                    // }
                });
        });
    }

    writeFolder(req) {
        return new Promise ((res, rej) => {
            console.log("started uploading");
            this.getUserFolder(req.user.user_id)
            .then(id => {
                var stack = [];
                fs.readFile(req.file.path, "base64", (err, data) => {
                    var title = this.prepName(req.file.originalname);
                    this.createFolder(title, id).then(file => {
                        var split_data = this.splitData(data + "");
                        const WAIT_TIME = 500;
                        var done = 0;
                        let cur = 0;
                        const int = setInterval(() => {
                            if(cur === split_data.length)
                                return clearInterval(int);
                           this.fileWrite(cur + "", split_data[cur] + "", file.data.id)
                            .then(x => {
                                done++;
                                console.log("uploading: " + (done*100/split_data.length) + "%");
                            }) 
                            .catch(x => {
                                console.log("Retrying file " + (done + 1) + "/" + split_data.length);
                                CustomElementRegistry(x);
                            })   
                            cur++;
                        }, WAIT_TIME);
                    })
                })
            })
        })
    }

    getUserFolder(userId) {
        return new Promise((res, rej) => {
            authorize(this.credentials, this.getFiles, "16Odad93Eb-xIsZPIbDXaESJBMv5vI-fX")
                .then(files => {
                    //date is in rfc 3339
                    //name, date, type, id
                    let found = false;

                    for (let i = 0; i < files.length; i++) {
                        //check for userId
                        if (files[i].name === userId + "") {
                            res(files[i].id);
                        }
                    }

                    if(!found)
                        this.createFolder(userId + "", "16Odad93Eb-xIsZPIbDXaESJBMv5vI-fX")
                        .then(x => res(x));
                });
        })
    }

    //puts the files together
    assembleFile(id) {
        return new Promise((res, rej) => {
            this.readFolder(id, id).then(full => {
                //puts base64 of the assembles parts of the folder into a buffer
                const buf = Buffer.from(full, "base64");
                this.printDocTitle(id).then(ret => {
                    const name = this.undoName(ret);
                    //writes the file
                    const dir = path.join("files", id, name);
                    mkdirp(path.dirname(dir), (err) => {
                        fs.writeFile(path.join("files", id, name), buf, ()=>{res("done")});
                    })
                })
            })
        })
        
    }

    //replaces the last instance of "." with "&"
    prepName(org) {
        console.log(org)
        console.log(org.lastIndexOf("."));
        var pos = org.lastIndexOf(".");
        return org.substring(0, pos) + "&" + org.substring(pos + 1);
    }

    //undos what prepName does
    undoName(org) {
        return org.replace("&", ".");
    }

    getUserFiles(userId) {
        return new Promise((res, rej) => {
            //authorizes the reading files in hihi drive
            authorize(this.credentials, this.getFiles, "16Odad93Eb-xIsZPIbDXaESJBMv5vI-fX")
                .then(files => {
                    //date is in rfc 3339
                    //name, date, type, id
                    let found = false;

                    //this.assembleFile("1rXd6SpfLrqT39_8L_V1_tjvDzyvXvqAp");
                    
                    for (let i = 0; i < files.length; i++) {
                        //check for userId
                        if (files[i].name === userId + "") {
                            found = true;
                            authorize(this.credentials, this.getFiles, files[i].id)
                                .then(data => {
                                    res(data.map(x => {
                                        return {
                                            //return data of each file
                                            id: x.id,
                                            name: this.undoName(x.name).substring(0, x.name.lastIndexOf("&")),
                                            date: moment(x.modifiedTime, "YYYY-MM-DDTHH:mm:ssZ").fromNow(),
                                            type: x.name.substring(x.name.lastIndexOf("&") + 1)
                                        }
                                    }));
                                })
                        }
                    }
                    if (!found)
                        res([]);
                });
        })
    }
}
module.exports = Drive;