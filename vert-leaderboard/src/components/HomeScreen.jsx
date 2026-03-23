import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllUsers } from "../firebase";
import { FadeLoader } from "react-spinners";
import Leaderboard from "./Leaderboard";
import DepartmentBoard from "./DepartmentBoard";
import "./HomeScreen.css";

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState();
  const navigate = useNavigate();

  const logout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.clear();
    navigate("/register");
  };

  useEffect(() => {
    const webId = localStorage.getItem("web-id");
    if (!webId) {
      navigate("/register");
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getAllUsers().then((users) => {
      setUsers(users);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !users) {
    return (
      <div className="home__loader">
        <FadeLoader
          loading={isLoading}
          speedMultiplier={0.8}
          color="#4a7fd4"
          cssOverride={{ display: "block", margin: "0 auto" }}
        />
      </div>
    );
  }

  return (
    <div className="home">
      <nav className="home__nav">
        <span className="home__nav-brand">ALODGE VERT LEADERBOARD</span>
        <div className="home__nav-links">
          <Link to={"register"} className="home__nav-link">
            Change Username
          </Link>
          <a href="#" onClick={logout} className="home__nav-link">
            Logout
          </a>
        </div>
      </nav>

      <div className="home__content">
        <div className="home__board-section">
          <div className="home__board-header">
            <h2 className="home__board-title">Individual Leaderboard</h2>
            <span className="home__board-count">
              {users.filter((u) => u.totalVert).length} riders
            </span>
          </div>
          <Leaderboard users={users} />
        </div>

        <div className="home__board-section">
          <div className="home__board-header">
            <h2 className="home__board-title">Department Leaderboard</h2>
          </div>
          <DepartmentBoard users={users} />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
