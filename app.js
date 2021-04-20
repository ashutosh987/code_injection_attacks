var express = require("express");
var session = require("express-session");
var app = express();
path = require("path");
var bodyParser = require("body-parser");

var mysql = require("mysql");
const { request } = require("http");

let child_process = require("child_process");
var connection = mysql.createConnection({
  host: "localhost",
  database: "xss",
  user: "root",
  password: "passwordgiven",
});

app.use(
  session({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,
    },
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("views", __dirname);
app.set("view engine", "ejs");

reviews = ["hi", '<script>alert("1");</script>'];

connection.connect(function (err) {
  if (err) {
    return;
  }
  console.log("Connected as id " + connection.threadId);
});

app.get("/", function (req, res) {
  //res.render("home.ejs", { users: [], error: "", errorf: "", feeds: [] });
  connection.query("select * from comment", (err, users) => {
    if (err) {
      res.render("home.ejs", {
        users: [],
        error: "NO feedback",
        feeds: users,
        errof: "",
      });
      return;
    }
    res.render("home.ejs", { users: [], error: "", feeds: users, errorf: "" });
    return;
  });
});

app.get("/sqlinjection", function (req, res) {
  res.redirect("/");
});

app.get("/xssinjection", function (req, res) {
  connection.query("select * from comment", (err, users) => {
    const formattedReviews = users
      .map((review) => `<p>${review.comment}</p>`)
      .join(" ");
    const send = "<h1>User</h1>" + formattedReviews;

    res.send(send);
    return;
  });
});

app.post("/xssinjection", function (req, res) {
  //   if (req.body.comment) reviews.push(req.body.comment);
  //   const formattedReviews = reviews
  //     .map((review) => `<p>${review}</p>`)
  //     .join(" ");
  //   const send = "<h1>User</h1>" + formattedReviews;
  //   res.send(send);
  //   return;
  var s = `insert into comment(comment) values('${req.body.feed}');`;
  console.log(s);
  connection.query(s, (err, users) => {
    connection.query("select * from comment", (err, users) => {
      const formattedReviews = users
        .map((review) => `<p>${review.comment}</p>`)
        .join(" ");
      const send = "<h1>User</h1>" + formattedReviews;

      res.send(
        '<form action="/xssinjection" method="POST"><label>enter your feedback</label><input type="text" placeholder="enter your feedback" name="feed" required><input type="submit">' +
          send
      );
      return;
    });
  });
});

app.get("/securedxssinjection", function (req, res) {
  res.redirect("/");
});

app.get("/sql", function (req, res) {
  res.render("SQL.ejs", { users: [], error: "", errorf: "" });
});

app.post("/sqlinjection", function (req, res) {
  console.log(req.body.user);

  var s = `select * from user where firstname = '${req.body.user}';`;
  console.log(s);
  connection.query(s, (err, users) => {
    if (err) {
      res.render("home.ejs", {
        users: users,
        error: "enter correct input!",
        errorf: "",
        feeds: [],
      });
      return;
    }
    res.render("SQL.ejs", { users: users, error: "", errorf: "", feeds: [] });
    return;
  });
});

app.post("/securedxssinjection", function (req, res) {
  var s = `insert into comment(comment) values('${req.body.feed}');`;
  console.log(s);
  connection.query(s, (err, users) => {
    connection.query("select * from comment", (err, users) => {
      if (err) {
        res.render("home.ejs", {
          users: [],
          error: "NO feedback",
          feeds: users,
          errorf: "",
        });
        return;
      }
      res.render("home.ejs", {
        users: [],
        error: "",
        feeds: users,
        errorf: "",
      });
      return;
    });
  });
});

app.post("/zip", function (req, res) {
  console.log(req.body.file);

  child_process.exec("gzip " + req.body.file, function (err, data) {
    console.log("err: ", err);
    console.log("data: ", data);
  });

  res.send("<p>Congrats,files got zipped</p>");
  return;
});

app.listen(4000, function () {
  console.log("Running");
});

setInterval(function () {
  connection.query("select 1");
}, 5000);
