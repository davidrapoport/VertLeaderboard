import React, { useState, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const Leaderboard = ({ users }) => {
  const gridRef = useRef();
  const fakeDanielsVert = (vert) => {
    const maybeDaniel = users.filter((u) => u.webId === "g98110tm-tf9-rp1");
    if (maybeDaniel.length !== 1) {
      return vert.toLocaleString() + " feet";
    }
    console.log(maybeDaniel);
    if (vert === maybeDaniel[0].totalVert) {
      return "1,000,000,000 feet";
    }
    return vert.toLocaleString() + " feet";
  };
  const [columnDefs, setColumnDefs] = useState([
    { field: "userName" },
    {
      field: "totalVert",
      sort: "desc",
      valueFormatter: (val) => fakeDanielsVert(val.value),
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
    rowDrag: false,
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
