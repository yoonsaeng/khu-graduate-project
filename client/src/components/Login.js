import { useState } from "react";

const Login = (props) => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const LoginHandler = async () => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        //auth 주소에서 받을 예정
        method: "POST", // method :통신방법
        headers: {
          // headers: API 응답에 대한 정보를 담음
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, password: password }), // id, password 보냄
      });

      const resJson = await response.json();

      if (resJson.isLogin === "True") {
        props.setMode("WELCOME");
        // 로그인 성공 시 토큰 저장
        localStorage.setItem("id", id);
        localStorage.setItem("accessToken", resJson.accessToken);
        localStorage.setItem("refreshToken", resJson.refreshToken);
        //onLogin();
      } else {
        alert(resJson.isLogin);
      }
    } catch (err) {
      throw err;
    }
  };

  const setIdHadler = (event) => {
    setId(event.target.value);
  };

  const setPasswordHandler = (event) => {
    setPassword(event.target.value);
  };

  return (
    <>
      <h2>로그인</h2>

      <div>
        <p>
          <input
            type="text"
            name="id"
            placeholder="아이디"
            onChange={setIdHadler}
          />
        </p>
        <p>
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            onChange={setPasswordHandler}
          />
        </p>

        <p>
          <input type="submit" value="로그인" onClick={LoginHandler} />
        </p>
      </div>

      <p>
        계정이 없으신가요?{" "}
        <button
          onClick={() => {
            props.setMode("SIGNIN");
          }}
        >
          회원가입
        </button>
      </p>
    </>
  );
};

export default Login;
