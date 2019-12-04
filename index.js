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
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const Drive = require('./drive.js');
const drive = new Drive();
const path = require("path");

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

// Logout route
app.get("/logout", (req, res) => {
    req.logout(); 
    res.redirect('/');
});

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
                res.redirect("/");
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

//api land
app.get("/api/test", (req, res) => {
    res.send("\"a response\"");
})
app.get("/api/account-img", (req, res) => {
    res.send(`"${req.user.photo}"`);
})
app.get("/api/isAuthenticated", (req, res) => {
    res.send(`${!!req.user}`);
});
app.get("/api/files", (req, res) => {
    drive.getUserFiles(req.user.user_id)
    .then(data => {
        console.log("/api/files")
        res.send(data);
    });
})
app.get("/api/files/:id", (req, res) => {
    drive.getUserFiles(req.user.user_id, req.params.id)
    .then(data => {
        console.log("/api/files")
        res.send(data);
    });
});

//Creates Folder
app.post("/api/createFolder", (req, res) => {
    drive.getUserFolder(req.user.user_id)
    .then(id => {
        console.log("folder id: " + id);
        drive.createFolder(req.body.title + "&folder", id)
        .then(res.send("ok"));
    })
});
app.post("/api/createFolder/:id", (req, res) => {
    drive.createFolder(req.body.title + "&folder", req.params.id)
    .then(res.send("ok"));
})

//Gets File
app.get("/api/getFile/:id", (req, res) => {
    drive.assembleFile(req.params.id)
    .then(x => {
        fs.readdir("files/" + req.params.id, (err, files) => {
            const name = files[0];
            res.download(__dirname + "/files/" + req.params.id + "/" + name);
        })
    })
});

//Deletes File
app.get("/api/delFile/:id", (req, res) => {
    drive.fileDelete(req.params.id)
    .then(x=> {
        res.send("deleted");
    });
})

let done = 0;

//writeFoldery
app.post("/api/uploadFile", upload.single('file'), (req, res) => {
    drive.writeFolder(req)
    .then (x => {
        res.send("uploaded");
    })
})
app.post("/api/uploadFile/:id", upload.single("file"), (req, res) => {
    drive.writeFolder(req, req.params.id)
    .then(x => {
        res.send("uploaded");
    })
})

app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname,'client', 'build', 'index.html'));
})

const port = process.env.PORT || 1337;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));