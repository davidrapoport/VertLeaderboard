import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component

import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../firebase";
import { FadeLoader } from "react-spinners";

const Leaderboard = () => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [savedWebId, setSavedWebId] = useState();
  const navigate = useNavigate();
  const [columnDefs, setColumnDefs] = useState([
    { field: "userName" },
    { field: "totalVert", sort: "desc" },
    { field: "vertSinceMonday" },
    { field: "bestStreak" },
    { field: "fastestCollinsLap" },
  ]);

  // DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(() => ({
    sortable: true,
  }));

  // Example of consuming Grid Event
  const cellClickedListener = useCallback((event) => {
    console.log("cellClicked", event);
  }, []);
  useEffect(() => {
    const webId = localStorage.getItem("web-id");
    if (!webId) {
      navigate("/register");
    }
    setSavedWebId(webId);
  }, []);

  // Example load data from sever
  useEffect(() => {
    getAllUsers().then((users) => {
      setRowData(users);
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
    <div>
      <div className="ag-theme-alpine" style={{ width: "100%", height: 500 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection="single"
        />
      </div>
    </div>
  );
};

export default Leaderboard;
