var express = require('express');
var router = express.Router();

var crypto = require("crypto");

const connection = require("../models/userModel");


//globals
loggedIn = false;
loggedInAs = "";

positionVector = {x: 0, y:0}; //the users location


function euclidianDistance(x1, y1, x2, y2){ // A function to calculate the distance between two coordinates
  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

function closestFoodBank(results) { // A function to find the shortest distance to a food bank
  array = []
  for (i of results){
    // filling a temporary array with objects with the name of the food bank and distance from user
    array.push({name: i.name, distance: (euclidianDistance(i.x, i.y, positionVector.x, positionVector.y))})
  }
  let temp = {name: "", distance: Infinity};
  for (i of array) { // finding the shortest distance
    if (i.distance < temp.distance) {
      temp = i;
    }
  }
  return temp;
}

function eucldianDistanceTestHarness(){//a test harness for euclidian distance
  if (euclidianDistance(5, 5, 10, 10).toFixed(5) != 7.07107){ //expected normal values
     return false;
  }

  if (euclidianDistance(0.123, 101200000, 132341, 0.000000001).toFixed(5) != 101200086.53212){ //large and small values
     return false;
  }
  
  if (euclidianDistance(-1000000, -20000, 5, 2).toFixed(5) != 1000205.01900){ //mix of negative and positive numbers
     return false;
  }

  return true;
}

function closestFoodBankTestHarness(){//test harness for the closestFoodBank function
  testData = [{name: "testData1", x: 0, y: 0}, {name: "testData2", x: 15, y: 10}, 
              {name: "testData3", x: 1424123, y: 0.0001}, {name: "testData4", x: -20, y: 123},
              {name: "testData5", x: 0.1, y:-200}]; //test data

  if (closestFoodBank(testData).name != "testData1") {
    return false;
  }

  return true;
}

//test harness output
console.log("eucldianDistance passed the test?", eucldianDistanceTestHarness());
console.log("closestFoodBank passed the test?", closestFoodBankTestHarness());


//------------------------Express gets and posts--------------------//


router.get('/', function(req, res, next) {
  res.render("home");
});

router.get('/donate', function(req, res, next) {
  res.render('donate');
});

router.get('/layout', function(req, res, next) {
  res.render('layout');
});

router.get('/home', function(req, res, next) {
  res.render('home');
});

router.get('/volunteer', function(req, res, next) {
  res.render('volunteer');
});

router.get("/stock", function(req, res, next){ //this gets retrieves the stock levels for all the food banks so it may be displayed
  sqlQuery = {sql: "SELECT foodBank.name, stock.name, stock.quantity from stock INNER JOIN foodBank on stock.foodBankID=foodBank.id;", nestTables: true};
  connection.query(sqlQuery, function (error, stockInfo) {
    if (error) throw error;
    connection.query("SELECT name FROM foodBank", function (error, foodBanks) {
      if (error) throw error;
        connection.query("SELECT foodBank.name, foodBank.x, foodBank.y FROM foodBank", function (error, results) {
          if (error) throw error;
          let result = closestFoodBank(results);
          res.render("stock", {stockInfo, foodBanks, result});
      });
    });
  });
})

router.post("/searchStockTableName", function(req, res, next){ //this allows users to search by food bank name
  console.log(req.body.foodBanks)
  sqlQuery = {sql: "SELECT foodBank.name, stock.name, stock.quantity from stock INNER JOIN foodBank on stock.foodBankID=foodBank.id where foodBank.name = ?;", nestTables: true};
  connection.query(sqlQuery, String(req.body.foodBanks), function (error, stockInfo) {
    if (error) throw error;
    connection.query("SELECT name FROM foodBank", function (error, foodBanks) {
      if (error) throw error;
      connection.query("SELECT foodBank.name, foodBank.x, foodBank.y FROM foodBank", function (error, results) {
        if (error) throw error;
        console.log(results)
        let result = closestFoodBank(results);
        res.render("stock", {stockInfo, foodBanks, result});
      });
    });
  });
});

router.get("/createReply", function(req, res, next) { //gets information related to replying
  if (loggedIn) {
    connection.query("SELECT * from forum", function (error, forumInfo) {
      if (error) throw error;
        res.render("createReply", {forumInfo, loggedInAs});
    });
  } else {
    connection.query("SELECT * from forum", function (error, forumInfo) {
      if (error) throw error;
        res.redirect("login");
    });  
  }
})

router.post("/createReply", function(req, res, next) { //sends users reply to sql database
  var sql = "insert into replies(title, content, username, replyTo) values (?, ?, ?, ?)";
  connection.query(sql, [String(req.body.title), String(req.body.content), String(loggedInAs), req.body.replyID], function(error, result){
    if (error) throw error;
    connection.query("SELECT * from forum", function (error, forumInfo) {
      if (error) throw error;
      res.redirect("/forum");
    });
  });
});

router.get("/createPost", function(req, res, next){ //retrieves information about if the users is logged in
  if (!loggedIn) {
    res.redirect("login");
  } else {
    res.render("createPost", {loggedInAs});
  }
});

router.post("/createPost", function(req, res, next){ //sends users post data to the database
  var sql = "insert into forum(title, content, username) values (?, ?, ?)";
  connection.query(sql, [String(req.body.title), String(req.body.content), String(loggedInAs)], function(error, result){
    if (error) throw error;
    connection.query("SELECT * from forum", function (error, forumInfo) {
      if (error) throw error;
      res.redirect("/forum");
    });
  });
});



router.get("/forum", function(req, res, next){ //gets all the posts so they may be displayed
  if (loggedIn) {
    connection.query("SELECT * from forum ORDER BY uniqueID desc", function (error, forumInfo) {
      if (error) throw error;
        res.render("forum", {forumInfo, loggedInAs});
    });
  } else {
    connection.query("SELECT * from forum ORDER BY uniqueID desc", function (error, forumInfo) {
      if (error) throw error;
        res.render("forum", {forumInfo});
    });  
  }
})



router.get("/lookAtPost", function(req, res, next){ //a function to look at any replys a post has
  connection.query("SELECT * FROM forum where title = ?", req.query.title, function (error, post) {
    if (error) throw error;
    connection.query("SELECT * from replies where replyTo = ? ORDER BY uniqueId desc", post[0].uniqueId, function (error, forumInfo) {
      if (error) throw error;
        postData = post[0];
        res.render("post", {postData, forumInfo});
    });
  });
})


router.get('/login', function(req, res, next) { //login
  loggedIn = false;
  loggedInAs = ""
  res.render("login", { title: "Login"})
});

router.get("/loggedIn", function(req, res, next){ //a little page to tell the user if they have logged in succesfully
  res.render("loggedIn", {loggedInAs})
})

router.post("/login", function (req, res, next) { //sending login details to sql server and checking if they are correct
  const username = req.body.username;
  const password = req.body.password;
   
  loggedIn = false;
  loggedInAs = "";

  const hash = crypto.createHash("md5").update(password).digest("hex"); //encrypt users password
  var sql = "select * from logininfo where username = ? and userpassword = ?";
  connection.query(sql, [username, hash], function(error, result){
    if (error) throw error;
    if (result.length > 0) {
      loggedIn = true;
      loggedInAs = username;

      res.redirect("/loggedIn");
    } else {
      res.render("login", {error : true});
    }
  });
});

router.get("/makeAccount", function (req, res, next) {
  res.render("makeAccount");
});

router.post("/makeAccount", function (req, res, next) {  //makes a users account (password info is encrypted.)
  const username = req.body.username;
  const password = req.body.password;
   
  loggedIn = false;
  loggedInAs = "";

  var hash = crypto.createHash('md5').update(password).digest('hex');
  var sql = "insert into logininfo(username, userpassword, adminbool) values (?, ?, ?)";
  connection.query(sql, [username, hash, false], function(error, result){
    if (error) throw error;

    loggedIn = true;
    loggedInAs = username;

    res.redirect("/loggedIn");

  });
});

module.exports = router;
