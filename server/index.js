const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser"); //req.body는 body-parser를 사용하기 전에는 디폴트 값으로 Undefined으로 설정, 따라서 읽어 오기 위해 body-parser 사용
const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt = require("bcrypt"); //암호화(hash)
const db = require("./db");
const sessionOption = require("./sessionOption");

require("dotenv").config();

const app = express();
const PORT = 3001;

const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore(sessionOption);

app.use(
  session({
    key: process.env.SESSION_COOKIE_KEY,
    secret: process.env.SESSION_COOKIE_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.send("hello");
});

app.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${PORT}`);
});
