import React from "react";

const LiftBreakdownTable = ({ numRidesPerLift }) => {
  const totalLaps = Object.values(numRidesPerLift).reduce((prev, acc) => prev + acc);

  return (
    <div className="donut__table-wrapper">
      <table className="donut__table">
        <thead>
          <tr>
            <th>Lift Name</th>
            <th>Laps</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(numRidesPerLift).map(([lift, count]) => (
            <tr key={lift}>
              <td>{lift}</td>
              <td>{count}</td>
              <td>{Math.round((count / totalLaps) * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LiftBreakdownTable;
