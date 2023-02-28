import React, { useState, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const Leaderboard = ({ users }) => {
  const gridRef = useRef();
  const [columnDefs, setColumnDefs] = useState([
    { field: "userName" },
    {
      field: "totalVert",
      sort: "desc",
      valueFormatter: (val) => val.value.toLocaleString() + " feet",
    },
    {
      field: "biggestDay",
      valueFormatter: (val) => val.value.toLocaleString() + " feet",
    },
    { field: "bestStreak" },
    {
      field: "fastestCollinsLap",
      valueFormatter: (val) =>
        Math.floor(val.value / 60) +
        " minutes " +
        (val.value % 60) +
        " seconds",
    },
    {
      field: "numberOfCucks",
    },
  ]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
  }));

  // We may have a user who hasn't had the refresh script run for them yet
  // ignore them here.
  users = users.filter((u) => u.totalVert);

  const tableHeight = Math.min(500, 42 * users.length + 64);

  return (
    <div>
      <div
        className="ag-theme-alpine"
        style={{ width: "100%", height: tableHeight }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={users}
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
