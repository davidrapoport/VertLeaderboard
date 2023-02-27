import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import { getAllUsers } from "../firebase";
import { FadeLoader } from "react-spinners";
import Leaderboard from "./Leaderboard";
import DepartmentBoard from "./DepartmentBoard";

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const webId = localStorage.getItem("web-id");
    if (!webId) {
      navigate("/register");
    }
  }, []);

  useEffect(() => {
    getAllUsers().then((users) => {
      setUsers(users);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div style={{ display: "flex", "flex-direction": "column" }}>
      <Link to={"register"}>Change your username</Link>
      <h1>Leaderboard</h1>
      <Leaderboard
        users={users.filter((u) => u.showInLeaderBoard)}
      ></Leaderboard>
      <h1>Department Leaderboard</h1>
      <DepartmentBoard users={users}></DepartmentBoard>
    </div>
  );
};

export default HomeScreen;
