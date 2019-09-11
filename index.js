const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Pee!'));

const port = process.env.PORT || 1337;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));