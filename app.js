const express = require('express');
const app = express();
var port = process.env.PORT || 3000;
app.get('/a', (req,res) => res.send("hello!"));
app.listen(port, () => console.log("running"));
