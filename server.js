var express = require("express");
var session = require("express-session");
var app = express();
path = require("path");
var bodyParser = require("body-parser");

var mysql = require("mysql");
const { request } = require("http");
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

connection.connect(function (err) {
  if (err) {
    return;
  }
  console.log("Connected as id " + connection.threadId);
});

app.get("/", function (req, res) {
  connection.query("select * from stolen", (err, users) => {
    if (err) {
      res.render("server.ejs", {
        users: [],
      });
      return;
    }
    res.render("server.ejs", { users: users });
    return;
  });
});

app.get("/steal/:id", function (req, res) {
  console.log(req.params.id);
  var s = `insert into stolen(comment) values('${req.params.id}');`;
  connection.query(s, (err, users) => {
    connection.query("select * from stolen", (err, users) => {
      if (err) {
        res.render("server.ejs", {
          users: [],
        });
        return;
      }
      res.render("server.ejs", { users: users });
      return;
    });
  });
});

app.listen(8000, function () {
  console.log("Running");
});

setInterval(function () {
  connection.query("select 1");
}, 5000);
