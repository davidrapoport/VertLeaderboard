import React, { useEffect, useState } from "react";
import {
  getDepartments,
  getUserFromWebId,
  updateOrRegisterUser,
} from "../firebase";
import { FadeLoader } from "react-spinners";
import "./Register.css";

function Register() {
  const [webId, setWebId] = useState("");
  const [hasStoredWebId, setHasStoredWebId] = useState(false);
  const [userName, setUserName] = useState("");
  const [showInLeaderBoard, setShowInLeaderBoard] = useState(true);
  const [department, setDepartment] = useState(getDepartments()[0]);
  const [isLoading, setIsLoading] = useState(true);

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
        setShowInLeaderBoard(data.showInLeaderBoard);
        setDepartment(data.department);
      }
      setIsLoading(false);
    });
  }, []);

  const validateWebId = (webId) => {
    return webId.search(/\w{8}-\w{3}-\w{3}/gm) !== -1;
  };

  const register = async () => {
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
      showInLeaderBoard,
      department,
    });

    if (success) {
      alert("Thank you for registering! See you soon");
      localStorage.setItem("web-id", cleanWebId);
    } else {
      alert("Sorry, there seems to be an issue. Try again I guess?");
    }
    setWebId("");
    setUserName("");
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
          color="maroon"
          cssOverride={{
            display: "block",
            margin: "0 auto",
            borderColor: "red",
          }}
        ></FadeLoader>
        {!isLoading && (
          <>
            <input
              type="text"
              className="register__textBox"
              value={webId}
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
            <div className="checkboxInputContainer">
              <label>
                Do you want to appear in the leaderboard?
                <br /> If not, your vert will still count towards your
                department.
              </label>
              <input
                type="checkbox"
                className="register__textBox"
                checked={showInLeaderBoard}
                onChange={(e) => setShowInLeaderBoard(!showInLeaderBoard)}
              />
            </div>
            <button className="register__btn" onClick={register}>
              {hasStoredWebId ? "Update" : "Register"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
export default Register;
