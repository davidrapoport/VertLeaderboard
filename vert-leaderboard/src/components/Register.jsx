import React, { useEffect, useState } from "react";
import {
  getDepartments,
  getUserFromWebId,
  updateOrRegisterUser,
} from "../firebase";
import { FadeLoader } from "react-spinners";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [webId, setWebId] = useState("");
  const [hasStoredWebId, setHasStoredWebId] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState(getDepartments()[0]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const storedWebId = localStorage.getItem("web-id");
    if (!storedWebId) {
      setIsLoading(false);
      return;
    }
    setHasStoredWebId(true);
    getUserFromWebId(storedWebId).then((docData) => {
      if (docData) {
        const data = docData.data();
        setWebId(data.webId);
        setUserName(data.userName);
        setDepartment(data.department);
      }
      setIsLoading(false);
    });
  }, []);

  const validateWebId = (webId) => {
    return webId.search(/\w{8}-\w{3}-\w{3}/gm) !== -1;
  };

  const register = async () => {
    if (password !== "skialta!") {
      alert("Incorrect password");
      return;
    }
    if (!userName) {
      alert("Please enter a User Name");
      return;
    }
    if (!webId || !validateWebId(webId)) {
      alert("Please enter your Web Id");
      return;
    }
    const cleanWebId = webId.toLowerCase().trim();
    const success = await updateOrRegisterUser({
      userName,
      webId: cleanWebId,
      department,
    });
    setWebId("");
    setUserName("");
    if (success) {
      alert(
        hasStoredWebId
          ? "Your data has been updated"
          : "Thank you for registering! Give it a minute " +
              "for your data to appear in the leaderboard."
      );
      localStorage.setItem("web-id", cleanWebId);
      navigate("/");
    } else {
      alert("Sorry, there seems to be an issue. Try again I guess?");
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
            <h1 className="register__heading">
              {hasStoredWebId ? "Your Profile" : "Register"}
            </h1>
            <p className="register__subheading">
              ALodge 25-26 · Staff Leaderboard
            </p>
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
              readOnly={hasStoredWebId}
              onChange={onChangeWebIdText}
              placeholder="Alta Web Id"
            />
            <input
              type="text"
              className="register__textBox"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="User name"
            />
            <div className="departmentInputContainer">
              <label>Which department are you in?</label>
              <select
                className="departmentSelect"
                name="selectedDepartment"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {getDepartments().map((dep) => (
                  <option value={dep} key={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
            <button className="register__btn" onClick={register}>
              {hasStoredWebId ? "Update Profile" : "Register"}
            </button>
            {!hasStoredWebId && (
              <div>
                Already registered? <Link to={"/login"}>Login</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
