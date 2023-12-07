import { useState } from "react";

const Signin = (props) => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const SigninHandler = async () => {
    try {
      const response = await fetch("http://localhost:8000/signin", {
        //signin 주소에서 받을 예정
        method: "post", // method :통신방법
        headers: {
          // headers: API 응답에 대한 정보를 담음
          "content-type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          password: password,
          rePassword: rePassword,
        }), //id, password, 다시 입력한 password를 보냄
      });

      const resJson = await response.json();

      if (resJson.isLogin === "True") {
        alert("회원가입이 완료되었습니다!");
        props.setMode("LOGIN");
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

  const setPasswordHadler = (event) => {
    setPassword(event.target.value);
  };

  const setRePasswordIdHadler = (event) => {
    setRePassword(event.target.value);
  };

  return (
    <>
      <h2>회원가입</h2>

      <div>
        <p>
          <input type="text" placeholder="아이디" onChange={setIdHadler} />
        </p>
        <p>
          <input
            type="password"
            placeholder="비밀번호"
            onChange={setPasswordHadler}
          />
        </p>
        <p>
          <input
            type="password"
            placeholder="비밀번호 확인"
            onChange={setRePasswordIdHadler}
          />
        </p>

        <p>
          <input type="submit" value="회원가입" onClick={SigninHandler} />
        </p>
      </div>

      <p>
        로그인화면으로 돌아가기{" "}
        <button
          onClick={() => {
            props.setMode("LOGIN");
          }}
        >
          로그인
        </button>
      </p>
    </>
  );
};

export default Signin;
