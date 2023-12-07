import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Signin from "./components/Signin";
import Refresh from "./components/Refresh";

import "./App.css";
import "./style/style.css";
import image from "./images/image.jpeg";

const App = () => {
  const [mode, setMode] = useState("");
  const [XSSmessage, setXSSmessage] = useState(``);
  const id = localStorage.getItem("id");
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const AuthHandler = async () => {
      const response = await fetch("http://localhost:8000/authcheck");

      const resJson = await response.json();

      if (resJson.isLogin === "True") {
        setMode("WELCOME");
      } else {
        setMode("LOGIN");
      }
    };

    AuthHandler();
  }, []);

  const logoutClickHandler = async () => {
    try {
      // "/logout" 엔드포인트에 GET 요청 보내기
      const response = await fetch("http://localhost:8000/logout", {
        method: "GET",
        credentials: "include", // 세션 쿠키를 서버에 보내기 위해 필요
      });

      const resJson = await response.json();

      if (resJson.isLogout === "True") {
        localStorage.removeItem("id");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setMode("LOGIN");
        alert("로그아웃");
      } else {
        alert("Fail");
      }
    } catch (err) {
      throw err;
    }
  };

  const setXSSmessageHandler = (event) => {
    setXSSmessage(event.target.value);
  };

  const excuteReactFunction = (message) => {
    try {
      // 사용자로부터 입력받은 텍스트를 사용하여 함수 생성
      const dynamicFunction = new Function("React", message);

      // React 객체를 전달하여 함수 실행
      dynamicFunction(React);
    } catch (err) {
      alert("REFLECTED XSS ATTACK FAIL");
    }
  };

  const reflectedXSSHandler = () => {
    excuteReactFunction(XSSmessage);
    alert("REFLECTED XSS ATTACK");
  };

  const storedXSSHandler = () => {
    if (id && accessToken && refreshToken) {
      alert(
        `STORED XSS ATTACK\nID:${id}\nACCESS_TOKEN:${accessToken}\nREFRESH_TOKEN:${refreshToken}`
      );
    } else {
      alert("STORED XSS ATTACK");
    }
  };

  let content = null;

  if (mode === "LOGIN") {
    content = <Login setMode={setMode}></Login>;
  } else if (mode === "SIGNIN") {
    content = <Signin setMode={setMode}></Signin>;
  } else if (mode === "WELCOME") {
    content = (
      <>
        <h2>로그인 성공 페이지</h2>
        <button onClick={logoutClickHandler}>로그아웃</button>
        <Refresh setMode={setMode} />
      </>
    );
  }

  return (
    <>
      <div>{content}</div>
      <p>
        <input
          type="text"
          placeholder="XSS Message"
          onChange={setXSSmessageHandler}
        />
      </p>
      <p>
        <button onClick={reflectedXSSHandler}>REFLECTED XSS ATTACK</button>
      </p>
      <img src={image} alt="Stored XSS" onClick={storedXSSHandler} />
    </>
  );
};

export default App;
