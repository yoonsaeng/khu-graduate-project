import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
// jwt-decode 4.0.0버전 import 방식

const Refresh = (props) => {
  const [expiresIn, setExpiresIn] = useState("0:00");
  const id = localStorage.getItem("id");
  const refreshToken = localStorage.getItem("refreshToken");
  const [accessToken, setAccessToken] = useState();

  const calculateExpiresIn = (accessToken) => {
    try {
      // AccessToken을 디코딩하여 Payload 획득
      const decodedToken = jwtDecode(accessToken);
      // 만료 시간 (exp) 추출
      const expirationTime = decodedToken.exp;
      // 현재 시간 (UTC) 획득
      const currentTime = Math.floor(Date.now() / 1000);
      // 남은 expiresIn 시간 계산 (초)
      const remainingTime = expirationTime - currentTime;
      // 분:초로 변환하여 문자열로 표시
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      if (minutes === 0 && seconds === 0) {
        logoutHandler();
      }
      // 상태 업데이트
      setExpiresIn(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
    } catch (err) {
      // 토큰 디코딩에 실패하면 예외 처리
      throw err;
    }
  };
  // useEffect를 사용하여 초기 로딩 시 expiresIn 계산
  useEffect(() => {
    // localStorage에서 AccessToken을 불러오기
    setAccessToken(localStorage.getItem("accessToken"));
    // 1초마다 calculateExpiresIn 함수 호출
    const intervalId = setInterval(() => {
      calculateExpiresIn(accessToken);
    }, 1000);
    // 컴포넌트가 언마운트될 때 interval 정리
    return () => clearInterval(intervalId);
  }, [accessToken]);

  const refreshHandler = async () => {
    try {
      const response = await fetch("http://localhost:8000/refresh", {
        //auth 주소에서 받을 예정
        method: "POST", // method :통신방법
        headers: {
          // headers: API 응답에 대한 정보를 담음
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, refreshToken: refreshToken }),
      });

      const resJson = await response.json();
      localStorage.setItem("accessToken", resJson.accessToken);
      setAccessToken(localStorage.getItem("accessToken"));
      calculateExpiresIn(accessToken);
    } catch (err) {
      logoutHandler();
      alert(err.message);
    }
  };

  const logoutHandler = async () => {
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
        props.setMode("LOGIN");
      } else {
        alert("Fail");
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <button onClick={refreshHandler}>{expiresIn}</button>
    </>
  );
};

export default Refresh;
