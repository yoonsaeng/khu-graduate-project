const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser"); //req.body는 body-parser를 사용하기 전에는 디폴트 값으로 Undefined으로 설정, 따라서 읽어 오기 위해 body-parser 사용
const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt = require("bcrypt"); //암호화(hash)
const db = require("./db");
const sessionOption = require("./sessionOption");

const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = 8000;

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

// // CORS 설정
// FrontEnd에서 Header 없이 Fetch할 시 사용 (안하면 접근 거부)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // 허용할 오리진을 여기에 설정
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", true);

  next();
});
// -> 서버 측 CORS 헤더 추가

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors({ origin: "http://localhost:3000" })); // CORS 미들웨어 사용

app.get("/authcheck", (req, res) => {
  const sendData = { isLogin: "" };
  if (req.session.is_logined) {
    sendData.isLogin = "True";
  } else {
    sendData.isLogin = "False";
  }
  res.send(sendData);
});

app.get("/logout", (req, res) => {
  const sendData = { isLogout: "" };
  req.session.destroy((err) => {
    if (err) {
      sendData.isLogout = "False";
    } else {
      sendData.isLogout = "True";
    }
    res.send(sendData);
  });
});

app.post("/login", (req, res) => {
  // 데이터 받아서 결과 전송
  const userId = req.body.id;
  const password = req.body.password;
  const sendData = {
    isLogin: "",
    accessToken: "",
    refreshToken: "",
  };

  if (userId && password) {
    // id와 pw가 입력되었는지 확인
    db.query(
      "SELECT * FROM userTable WHERE username = ?",
      [userId],
      (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
          // db에서의 반환값이 있다 = 일치하는 아이디가 있다.

          bcrypt.compare(password, results[0].password, (err, result) => {
            // 입력된 비밀번호가 해시된 저장값과 같은 값인지 비교

            if (result === true) {
              // 비밀번호가 일치하면
              const accessToken = jwt.sign(
                { userId },
                process.env.ACCESS_SECRET_KEY,
                {
                  expiresIn: "1m",
                }
              );
              const refreshToken = jwt.sign(
                { userId },
                process.env.REFRESH_SECRET_KEY,
                {
                  expiresIn: "2m",
                }
              );
              req.session.is_logined = true; // 세션 정보 갱신
              req.session.userId = userId;
              req.session.save(() => {
                sendData.isLogin = "True";
                sendData.accessToken = accessToken;
                sendData.refreshToken = refreshToken;
                res.send(sendData);
              });
              db.query(
                `INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'login' , ?, ?)`,
                [req.session.userId, "-", `React 로그인 테스트`],
                (error, result) => {}
              );
            } else {
              // 비밀번호가 다른 경우
              sendData.isLogin = "로그인 정보가 일치하지 않습니다.";
              res.send(sendData);
            }
          });
        } else {
          // db에 해당 아이디가 없는 경우
          sendData.isLogin = "아이디 정보가 일치하지 않습니다.";
          res.send(sendData);
        }
      }
    );
  } else {
    // 아이디, 비밀번호 중 입력되지 않은 값이 있는 경우
    sendData.isLogin = "아이디와 비밀번호를 입력하세요!";
    res.send(sendData);
  }
});

app.post("/signin", (req, res) => {
  // 데이터 받아서 결과 전송
  const userId = req.body.id;
  const password = req.body.password;
  const rePassword = req.body.rePassword;

  const sendData = { isSuccess: "" };

  if (userId && password && rePassword) {
    db.query(
      "SELECT * FROM userTable WHERE username = ?",
      [userId],
      (error, results) => {
        // DB에 같은 이름의 회원아이디가 있는지 확인
        if (error) throw error;
        if (results.length <= 0 && password == rePassword) {
          // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
          const hasedPassword = bcrypt.hashSync(password, 10); // 입력된 비밀번호를 해시한 값
          db.query(
            "INSERT INTO userTable (username, password) VALUES(?,?)",
            [userId, hasedPassword],
            (error, result) => {
              if (error) throw error;
              req.session.save(() => {
                sendData.isSuccess = "True";
                res.send(sendData);
              });
            }
          );
        } else if (password != rePassword) {
          // 비밀번호가 올바르게 입력되지 않은 경우
          sendData.isSuccess = "입력된 비밀번호가 서로 다릅니다.";
          res.send(sendData);
        } else {
          // DB에 같은 이름의 회원아이디가 있는 경우
          sendData.isSuccess = "이미 존재하는 아이디 입니다!";
          res.send(sendData);
        }
      }
    );
  } else {
    sendData.isSuccess = "아이디와 비밀번호를 입력하세요!";
    res.send(sendData);
  }
});

app.post("/refresh", (req, res) => {
  const username = req.body.id;
  const refreshToken = req.body.refreshToken;
  const sendData = {
    accessToken: "",
  };

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
      // throw err;
    }

    const accessToken = jwt.sign({ username }, process.env.ACCESS_SECRET_KEY, {
      expiresIn: "1m",
    });
    req.session.save(() => {
      sendData.accessToken = accessToken;
      res.send(sendData);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${PORT}`);
});
