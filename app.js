const express = require('express');
const app = express();
var request = require("request")




var firebase = require("firebase")
const config = {
  apiKey: "AIzaSyC6gQtGID3OKTFfiO4YBfLGliQ6_v9tb8A",
  authDomain: "movie-helper-db.firebaseapp.com",
  databaseURL: "https://movie-helper-db.firebaseio.com",
  projectId: "movie-helper-db",
  storageBucket: "movie-helper-db.appspot.com",
  messagingSenderId: "221734932563"
};
firebase.initializeApp(config);
this.database = firebase.database().ref().child('Liked');


app.get('/api/liked/:userId', (req, res) => {
  const owner = req.params.userId;
  var value = [];
  var movieRows = [];
  //GET LIKED MOVIES ID
  this.database.orderByChild("owner").equalTo(owner).on('value', (snapshot) => {
    //LOOPING EACH CHILD AND PUSHING TO ARRAY
    snapshot.forEach(item => {
      const temp = item.val();
      value.push(temp);
    });

    for (var i = 0; i < value.length; i++) {
      var urlString2 = "https://api.themoviedb.org/3/movie/" + value[i].movieID + "?api_key=60a27eb65f7bfc6491658e507c3c57ec&language=en-US"
      request({
        url: urlString2, json: true
      }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          movieRows.push(body)
        }
      })
    }//for loop end
  })//DB END
  // time out to collect data.
  setTimeout(() => {
  res.json(movieRows);
  }, 1000);
})

















app.get('/api/search/:title', (req, res) => {
  const title = req.params.title;
  const url = "https://api.themoviedb.org/3/search/movie?api_key=60a27eb65f7bfc6491658e507c3c57ec&language=en-US&query=" + title
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.json(body.results);
    }
  })
});


var port = process.env.PORT || 3000;
app.get('/', (req,res) => res.send("hello!"));

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

app.get('/api/cinema', (req, res) => {
  const url = "https://api.themoviedb.org/3/movie/now_playing?api_key=60a27eb65f7bfc6491658e507c3c57ec&language=en-US&page=1"
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
