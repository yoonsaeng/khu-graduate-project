import { useState, useEffect } from "react";
import Login from "./components/Login";
import Signin from "./components/Signin";
import Refresh from "./components/Refresh";

import "./App.css";
import "./style/style.css";

const App = () => {
  const [mode, setMode] = useState("");

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
    </>
  );
};

export default App;
