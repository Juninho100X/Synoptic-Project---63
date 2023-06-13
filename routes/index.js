var express = require('express');
var router = express.Router();

var crypto = require("crypto");

const connection = require("../models/userModel");

loggedIn = false;
loggedInAs = "";

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

router.get("/stock", function(req, res, next){
  sqlQuery = {sql: "SELECT foodBank.name, stock.name, stock.quantity from stock INNER JOIN foodBank on stock.foodBankID=foodBank.id;", nestTables: true};
  connection.query(sqlQuery, function (error, stockInfo) {
    if (error) throw error;
    console.log(stockInfo)
    res.render("stock", {stockInfo});
  });
})

router.get("/createReply", function(req, res, next) {
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

router.post("/createReply", function(req, res, next) {
  var sql = "insert into replies(title, content, username, replyTo) values (?, ?, ?, ?)";
  connection.query(sql, [String(req.body.title), String(req.body.content), String(loggedInAs), req.body.replyID], function(error, result){
    if (error) throw error;
    connection.query("SELECT * from forum", function (error, forumInfo) {
      if (error) throw error;
      res.redirect("/forum");
    });
  });
});

router.get("/createPost", function(req, res, next){
  if (!loggedIn) {
    res.redirect("login");
  } else {
    res.render("createPost", {loggedInAs});
  }
});

router.post("/createPost", function(req, res, next){
  var sql = "insert into forum(title, content, username) values (?, ?, ?)";
  connection.query(sql, [String(req.body.title), String(req.body.content), String(loggedInAs)], function(error, result){
    if (error) throw error;
    connection.query("SELECT * from forum", function (error, forumInfo) {
      if (error) throw error;
      res.redirect("/forum");
    });
  });
});


router.get("/forum", function(req, res, next){
  if (loggedIn) {
    connection.query("SELECT * from forum", function (error, forumInfo) {
      if (error) throw error;
        res.render("forum", {forumInfo, loggedInAs});
    });
  } else {
    connection.query("SELECT * from forum", function (error, forumInfo) {
      if (error) throw error;
        res.render("forum", {forumInfo});
    });  
  }
})



router.get("/lookAtPost", function(req, res, next){
  connection.query("SELECT * FROM forum where title = ?", req.query.title, function (error, post) {
    if (error) throw error;
    connection.query("SELECT * from replies where replyTo = ?", post[0].uniqueId, function (error, forumInfo) {
      if (error) throw error;
        postData = post[0];
        console.log(postData)
        res.render("post", {postData, forumInfo});
    });
  });
})


router.get('/login', function(req, res, next) {
  loggedIn = false;
  loggedInAs = ""
  res.render("login", { title: "Login"})
});

router.get("/loggedIn", function(req, res, next){
  res.render("loggedIn", {loggedInAs})
})

router.post("/login", function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
   
  loggedIn = false;
  loggedInAs = "";

  const hash = crypto.createHash("md5").update(password).digest("hex");
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

module.exports = router;
