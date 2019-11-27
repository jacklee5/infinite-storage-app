
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
        const content = fs.readFileSync('credentials.json');
        const credentials = JSON.parse(content);
        this.credentials = credentials;

        //file read
        //file write
        //file delete
        //create folder
        //getFiles
        //readFolder
        //writeFolder
        //getUserFolder
        //getUserFiles
        //each queue entry be like
        /**
         * {
         *  f: ()=>{}
         *  args: []
         * }
        */

        this.queue = [];
        setInterval(() => {
            if(this.queue.length == 0) return;
            const entry = this.queue.shift();
            entry.f.bind(this)(...entry.args, true)
            .then(x => {
                return entry.res(x)
            })
            .catch(err => {
                console.log("retrying function " + entry.f.name);
                this.addToQueue(entry.f, entry.args);
            });
        }, 500);

        this.getFiles = this.getFiles.bind(this);
    }

    addToQueue(f, args){
        return new Promise((res, rej) => {
            this.queue.push({
                f: f,
                args: args,
                res: res
            })
        })
        
    }

    fileRead(id, inQueue) {
        if(!inQueue){
            return this.addToQueue(this.fileRead, [id]);
        }
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
                        throw "failed to read file"
                    };
                    res(response.data);
                })
            })
        });
    }

    fileWrite(title, data, folder, inQueue) {
        if(!inQueue){
            return this.addToQueue(this.fileWrite, [title, data, folder]);
        }
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

    fileDelete(id, inQueue) {
        if(!inQueue){
            return this.addToQueue(this.fileDelete, [id]);
        }
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

    createFolder(title, parent, inQueue) {
        if(!inQueue){
            return this.addToQueue(this.createFolder, [title, parent]);
        }
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
    getFiles(auth, folderId, inQueue) {
        if(!inQueue){
            return this.addToQueue(this.getFiles, [auth, folderId]);
        }
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

    readFolder(auth, folderId, inQueue) {
        if(!inQueue){
            return this.addToQueue(this.readFolder, [auth, folderId]);
        }
        return new Promise((res, rej) => {
            authorize(this.credentials, this.getFiles, folderId)
                .then(files => {
                    console.log("memes")
                    var full = "";
                    //sort files in folder by name
                    files.sort((a, b) => {
                        return Number(a.name) - Number(b.name);
                    })
                    Promise.all(files.map((x, i) => {
                        return this.fileRead(x.id);
                    }))
                    .then(values => {
                        for(let i = 0; i < files.length; i++){
                            console.log((i*100/files.length) + "% done downloading");
                            full += values[i].substring(1);
                        }
                        res(full);
                    });
                });
        });
    }

    writeFolder(req, folderId, inQueue) {
        if(!inQueue){
            return this.addToQueue(this.writeFolder, [req, folderId]);
        }
        return new Promise ((res, rej) => {
            console.log("started uploading");
            this.getUserFolder(req.user.user_id)
            .then(id => {
                var stack = [];
                fs.readFile(req.file.path, "base64", (err, data) => {
                    var title = this.prepName(req.file.originalname);
                    const actualId = folderId === undefined ? folderId : id;
                    console.log(actualId);
                    this.createFolder(title, actualId).then(file => {
                        var split_data = this.splitData(data + "");
                        var done = 0;
                        for(let i = 0; i < split_data.length; i++){
                            
                            this.fileWrite(i + "", split_data[i] + "", file.data.id)
                            .then(x => {
                                done++;
                                console.log("uploading: " + (done*100/split_data.length) + "%");
                            })
                        }
                    })
                })
            })
        })
    }

    getUserFolder(userId, inQueue) {
        if(!inQueue){
            return this.addToQueue(this.getUserFolder, [userId]);
        }
        return new Promise((res, rej) => {
            authorize(this.credentials, this.getFiles, "16Odad93Eb-xIsZPIbDXaESJBMv5vI-fX")
                .then(files => {
                    //date is in rfc 3339
                    //name, date, type, id
                    let found = false;

                    for (let i = 0; i < files.length; i++) {
                        //check for userId
                        if (files[i].name === userId + "") {
                            found = true;
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

    getUserFiles(userId, folderId, inQueue) {
        if(!inQueue){
            return this.addToQueue(this.getUserFiles, [userId, folderId]);
        }
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
                            authorize(this.credentials, this.getFiles, folderId || files[i].id)
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