import React, { useState, useRef, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { getDepartmentTeamName } from "../firebase";

const DepartmentBoard = ({ users }) => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([
    { field: "teamName", wrapText: true, autoHeight: true },
    {
      field: "averageVert",
      sort: "desc",
      valueFormatter: (val) => Math.floor(val.value).toLocaleString() + " feet",
    },
    {
      field: "averageBiggestDay",
      valueFormatter: (val) => Math.floor(val.value).toLocaleString() + " feet",
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

  useEffect(() => {
    const departmentsMap = {};
    users.forEach((user) => {
      if (!(user.department in departmentsMap)) {
        departmentsMap[user.department] = [];
      }
      departmentsMap[user.department].push(user);
    });
    const departmentData = [];
    Object.keys(departmentsMap).forEach((dep) => {
      const usersInDep = departmentsMap[dep];
      const data = {};

      const totalVert = usersInDep.reduce((acc, { totalVert }) => {
        return acc + totalVert;
      }, 0);
      data["averageVert"] = totalVert / usersInDep.length;

      data["averageBiggestDay"] =
        usersInDep.reduce((acc, { biggestDay }) => {
          return acc + biggestDay;
        }, 0) / usersInDep.length;

      data["bestStreak"] = Math.max(...usersInDep.map((u) => u.bestStreak));

      data["fastestCollinsLap"] = Math.min(
        ...usersInDep.map((u) => u.fastestCollinsLap)
      );

      data["numberOfCucks"] = usersInDep.reduce((acc, { numberOfCucks }) => {
        return acc + numberOfCucks;
      }, 0);

      data["teamName"] = getDepartmentTeamName(dep);
      departmentData.push(data);
    });
    setRowData(departmentData);
  }, [users]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
  }));

  const tableHeight = Math.min(500, 42 * rowData.length + 64);

  return (
    <div>
      <div
        className="ag-theme-alpine"
        style={{ width: "100%", height: tableHeight }}
      >
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

export default DepartmentBoard;
