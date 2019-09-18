const express = require('express');
const drive = require('./drive.js')
const app = express();

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));

const port = process.env.PORT || 1337;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

drive();