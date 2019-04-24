const express = require('express');
const app = express();
var request = require("request")

var port = process.env.PORT || 3000;
app.get('/a', (req,res) => res.send("hello!"));

app.get('/api/upc', (req, res) => {
  const url = "https://api.themoviedb.org/3/movie/upcoming?api_key=60a27eb65f7bfc6491658e507c3c57ec&language=en-US&page=1"
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.json(body.results);
    }
  })
});

app.listen(port, () => console.log("running"));
