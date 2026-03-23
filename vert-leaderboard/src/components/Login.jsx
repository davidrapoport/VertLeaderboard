import React, { useEffect, useState } from "react";
import { getUserFromWebId } from "../firebase";
import { FadeLoader } from "react-spinners";
import "./Register.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [webId, setWebId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const storedWebId = localStorage.getItem("web-id");
    if (!storedWebId) {
      setIsLoading(false);
      return;
    }
    navigate("/");
  }, []);

  const validateWebId = (webId) => {
    return webId.search(/\w{8}-\w{3}-\w{3}/gm) !== -1;
  };

  const login = async () => {
    if (password !== "skialta!") {
      alert("Incorrect password");
      return;
    }
    if (!webId || !validateWebId(webId)) {
      alert("Please enter your Web Id");
      return;
    }
    const cleanWebId = webId.toLowerCase().trim();
    const success = !!(await getUserFromWebId(cleanWebId));
    setWebId("");
    if (success) {
      localStorage.setItem("web-id", cleanWebId);
      navigate("/");
    } else {
      alert(
        "Sorry, we couldn't find that web id." +
          " Register it to add it to the leaderboard."
      );
    }
  };

  const onChangeWebIdText = (e) => {
    let text = e.target.value;
    if (text.length === 8 || text.length === 12) {
      text = text + "-";
    }
    if (text.endsWith("--")) {
      text = text.substring(0, text.length - 1);
    }
    setWebId(text);
  };

  return (
    <div className="register">
      <div className="register__container">
        <FadeLoader
          loading={isLoading}
          speedMultiplier={0.8}
          color="#4a7fd4"
          cssOverride={{ display: "block", margin: "0 auto 24px" }}
        />
        {!isLoading && (
          <>
            <h1 className="register__heading">Welcome Back</h1>
            <p className="register__subheading">Alta Ski Area · Staff Leaderboard</p>
            <input
              type="password"
              className="register__textBox"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <input
              type="text"
              className="register__textBox"
              value={webId}
              onChange={onChangeWebIdText}
              placeholder="Alta Web Id"
            />
            <button className="register__btn" onClick={login}>
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
