// Required dependencies 
const express = require('express');
const app = express();
const http = require('http').Server(app);
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const fs = require("fs");
const sql = require("mssql");
const bodyParser = require("body-parser");

//dev or prod
const HOST = process.env.NODE_ENV ? "https://berdbox.azurewebsites.net/" : "http://localhost:1337";

// Create a configuration object for our Azure SQL connection parameters
const dbConfig = {
    server: "berd-box.database.windows.net", // Use your SQL server name
    database: "berd-box", // Database to connect to
    user: "berd", // Use your username
    password: "abc1234!", // Use your password
    port: 1433,
    // Since we're on Windows Azure, we need to set the following options
    options: {
        encrypt: true
    }
};

const conn = new sql.ConnectionPool(dbConfig);

conn.connect()
    // Successfull connection
    .then(function () {
        console.log("connected to database");



    })
    // Handle connection errors
    .catch(function (err) {
        console.log(err);
        conn.close();
    });

app.use("/static", express.static("static"));

// cookieSession config
app.use(cookieSession({
    keys: ['wowiearandomstring']
}));

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Strategy config
passport.use(new GoogleStrategy({
        clientID: '851978840422-1jcjj81d4halkqfg237gaj1dhhp85f3b.apps.googleusercontent.com',
        clientSecret: 'y4rbqpsWYuJAbFUGfPBzw5K8',
        callbackURL: HOST + "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
        const id = profile.id;
        if (cache[id]) {
            done(null, cache[id]);
            return;
        }
        conn.query `SELECT * FROM users WHERE google_id = ${id}`
            .then(result => {
                const results = result.recordset;
                if (!results[0]) {
                    done(null, Object.assign(profile, {photo: profile.photos[0].value}));
                    return;
                }
                const data = {
                    user_id: results[0].user_id,
                    id: results[0].google_id,
                    username: results[0].username,
                    photo: results[0].photo
                }
                done(null, data);
                cache[id] = data;
            })
            .catch(err => {
                console.log(err);
            })
    }
));

//store google data for users that haven't been created yet
const googleData = {}

//cache users
const cache = {}

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
    if (user.provider) googleData[user.id] = user;
    done(null, user.id);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((id, done) => {
    if (cache[id]) {
        done(null, cache[id]);
        return;
    }
    conn.query `SELECT * FROM users WHERE google_id = ${id}`
        .then(result => {
            const results = result.recordset;
            if (!results[0]) {
                console.log("rejoice for i have arrived:" + googleData[id]);
                done(null, {
                    id: googleData[id].id,
                    photo: googleData[id].photos[0].value,
                    displayName: googleData[id].displayName
                });
                return;
            }
            if (googleData[id]) delete googleData[id];
            const data = {
                user_id: results[0].user_id,
                id: results[0].google_id,
                username: results[0].username,
                photo: results[0].photo
            }
            done(null, data);
            cache[id] = data;
        })
        .catch(err => console.log(err))
});

// Middleware to check if the user is authenticated
function isUserAuthenticated(req, res, next) {
    if (req.user && !googleData[req.user.id]) {
        next();
    } else {
        res.redirect("/auth/google");
    }
}
//static
app.use("/static", express.static("static"));

app.get("/", isUserAuthenticated, (req, res) => {
    res.send("you are authenticated");
})

// passport.authenticate middleware is used here to authenticate the request
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile'] // Used to specify the required data
}));

// The middleware receives the data from Google and runs the function on Strategy config
app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    conn.query `SELECT username FROM users WHERE google_id = ${req.user.id}`
        .then(results => {
            const result = results.recordset;
            if (result[0]) {
                res.redirect("/account");
            } else {
                conn.query`INSERT INTO users (username, google_id, photo) VALUES (${req.user.displayName}, ${req.user.id}, ${req.user.photo})`
                .then(result => {
                    const results = result.recordset;
                    console.log(`Successfully created new account:\n\tUsername: ${req.user.displayName}\n\tGoogle ID: ${req.user.id}\n\tPhoto: ${req.user.photo}`);
                    res.redirect("/");
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.send("an error occurred");
        })
});


// const port = process.env.PORT || 1337;
// app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Docs API.
  authorize(JSON.parse(content), printDocTitle);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
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

/**
 * Prints the title of a sample doc:
 * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
 */
function printDocTitle(auth) {
  const docs = google.docs({version: 'v1', auth});
  docs.documents.get({
    documentId: '195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log(`The title of the document is: ${res.data.title}`);
  });
}