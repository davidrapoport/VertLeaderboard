import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartments, updateOrRegisterUser } from "../firebase";
import "./Register.css";

function Register() {
  const [webId, setWebId] = useState("");
  const [userName, setUserName] = useState("");
  const [showInLeaderBoard, setShowInLeaderBoard] = useState(true);
  const [department, setDepartment] = useState(getDepartments()[0]);
  const navigate = useNavigate();
  const register = () => {
    if (!userName) alert("Please enter a User Name");
    if (!webId) alert("Please enter your Web Id");
    updateOrRegisterUser({
      userName,
      webId,
      showInLeaderBoard,
      department,
    });
  };
  return (
    <div className="register">
      <div className="register__container">
        <input
          type="text"
          className="register__textBox"
          value={webId}
          onChange={(e) => setWebId(e.target.value)}
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
          <label>Which Department are you in?</label>

          <select
            className="departmentSelect"
            name="selectedDepartment"
            defaultValue={department}
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
            <br /> If not your vert will still count towards your department.
          </label>
          <input
            type="checkbox"
            className="register__textBox"
            checked={showInLeaderBoard}
            onChange={(e) => setShowInLeaderBoard(!showInLeaderBoard)}
          />
        </div>
        <button className="register__btn" onClick={register}>
          Register
        </button>
      </div>
    </div>
  );
}
export default Register;
