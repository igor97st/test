const express = require('express');
const app = express();
var request = require("request")

// set up firebase settings
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
//

// Modify access controll protocols to allow access. 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

// Find movies to recommend
app.get('/api/recommend/:userId', (req, res) => {
  var owner = req.params.userId;
  var user = [];
  var all = [];
  var temp = [];
  var results = [];
  var movieRows = [];
  var id = [];
  // get liked list for this user
  this.database.orderByChild("owner").equalTo(owner).on('value', (snapshot) => {
    snapshot.forEach(item => {
      const temp = item.val();
      user.push(temp);
      id.push(temp.movieID)
    });
  })
  // get all liked lists
  this.database.orderByChild("owner").on('value', (snapshot) => {
    snapshot.forEach(item => {
      const temp = item.val();
      all.push(temp);
    });
  })
  // LOOP FOR THIS USER
    for (var a = 0; a < user.length; a++) {
      //LOOP FOR ALL USERS
      for (var i = 0; i < all.length; i++) {
        // IF SAME MOVIE ID
        if (all[i].movieID === user[a].movieID) {
          // SEE IF ITS THE SAME USER
          if (all[i].owner === user[a].owner) {
            // IGNORE THE SAME USER
          } else {
            // GET DATA FOR SPECIFIC USER
            var specificUser = [];
            this.database.orderByChild("owner").equalTo(all[i].owner).on('value', (snapshot) => {
              snapshot.forEach(item => {
                const temp = item.val();
                specificUser.push(temp.movieID);
              });
            })
            console.log(id)
            // ADD SPECIFIC USERS MOVIE IDS TO THE LIST IF THEY ARE NEW
              for (var s = 0; s < specificUser.length; s++) {
                // SEE IF USER LIKED IT AND IF TEMP HAS IT ALREADY
                if (id.includes(specificUser[s]) === false & temp.includes(specificUser[s]) === false) {
                  temp.push(specificUser[s])
                  
                }
              }
          }
        }
      }
    }
  //GET DATA FOR MOVIES
  setTimeout(() => {
    for (var d = 0; d < temp.length; d++) {
      var urlString2 = "https://api.themoviedb.org/3/movie/" + temp[d] + "?api_key=60a27eb65f7bfc6491658e507c3c57ec&language=en-US"
      request({
        url: urlString2, json: true
      }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          movieRows.push(body)
        }
      })
    }
  }, 2000);
  // CHECK RESULTS IF > 10 THEN USE GENRES TO FILTER.
  setTimeout(() => {
    if (movieRows.length < 10) {
      // IF LESS THEN 10 RETURN ALL.
      res.json(movieRows);
    } else {

      // IF TOO MANY MOVIES THEN SORT BY GENRE
      // CREATE NEW ARRAY TO HOLD UNIQUE GENRES
      genre = [];  
      // METHOD TO SAVE UNIQE GENRES
      genreFilter(movieRows, genre);

      // FOR MOVIES OTHER USERS LIKED CHECK GENRES
      setTimeout(() => {
        movieRows.forEach((movie) => {
          for (var i = 0; i < movie.genres.length; i++) {
            // SEE IF GENRES MATCH AND MOVIE IS UNIQUE
            if (genre.includes(movie.genres[i].id) === true & results.includes(movie) === false & results.length < 21 === true) {
              results.push(movie)
            }
          }
        })
      }, 1000);
      setTimeout(() => {
        res.json(results);
      }, 3000);
    }
  }, 4000);
});

// Find top 5 movies
app.get('/api/top', (req, res) => {
  //get all liked movies from DB
  var all = [];
  // GET ALL MOVIES ID
  this.database.orderByChild("owner").on('value', (snapshot) => {
    snapshot.forEach(item => {
      const temp = item.val();
      all.push(temp.movieID);
    });
  })

  // sort it to process later
  setTimeout(() => {
    all.sort();
  }, 500);
  
  // find the top 10
  var movieID = [];
  var amoutOfLikes = [];
  var prev = 0;
  setTimeout(() => {
    for (var i = 0; i < all.length; i++) {
      if (all[i] !== prev) {
        movieID.push(all[i]);
        amoutOfLikes.push(1);
      } else {
        amoutOfLikes[amoutOfLikes.length - 1]++;
      }
      prev = all[i];
    }
  }, 1000);

  var result = [];
  // find top ten
  setTimeout(() => {


    for (var i = 0; i < 5; i++) {

      var maxIndex = indexOfMax(amoutOfLikes)

      // add top movie to the list

      result.push(movieID[maxIndex]);

      // remove max from the lists.

      amoutOfLikes.splice(maxIndex, 1);
      movieID.splice(maxIndex, 1);
    }
  }, 1000);

  var movieRows = [];

  setTimeout(() => {
    //GET DATA FOR MOVIES
    for (var d = 0; d < result.length; d++) {
      var urlString2 = "https://api.themoviedb.org/3/movie/" + result[d] + "?api_key=60a27eb65f7bfc6491658e507c3c57ec&language=en-US"
      request({
        url: urlString2, json: true
      }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          movieRows.push(body)
        }
      })
    }
  }, 1000);

  setTimeout(() => {
    res.json(movieRows);
  }, 2000);
  
});


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

app.get('/api/upcoming', (req, res) => {
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

function genreFilter(tempRows, genre){
    tempRows.forEach((movie) => {
      for (var i = 0; i < movie.genres.length; i++) {
        // SAVE UNIQE GENRES TO THE LIST
        if (genre.includes(movie.genres[i].id) === false) {
          genre.push(movie.genres[i].id)
          
        }
      }
    })
}

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}

app.listen(port, () => console.log("running"));
