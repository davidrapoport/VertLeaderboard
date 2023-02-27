import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import HomeScreen from "./components/HomeScreen";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<HomeScreen />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/leaderboard" element={<HomeScreen />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
