import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const liftToColor = {
  Collins: "#0E1FE9",
  Wildcat: "#F31705",
  Sugarloaf: "#61C925",
  Supreme: "#1D1D1D",
  Sunnyside: "#E9F809",
  Albion: "#09F8DF",
  "Collins Angle": "#F809C9",
  Tram: "#fc7b0a",
  "Gad Zoom": "#fcec0a",
  "Mineral Basin": "#0ab2fa",
  Peruvian: "#11451e",
  Chickadee: "#4b4a61",
};

const getColorFromLift = (name) => liftToColor[name] ?? "#636363";

const RidesPieChart = ({ numRidesPerLift }) => {
  const data = Object.entries(numRidesPerLift).map(([lift, count]) => ({
    name: lift,
    value: count,
    color: getColorFromLift(lift),
  }));

  return (
    <div className="donut__chart-wrapper">
      <div className="donut__legend">
        {data.map(({ name, color }) => (
          <div className="donut__legend-item" key={name}>
            <span className="donut__legend-swatch" style={{ background: color }} />
            <span className="donut__legend-label">{name}</span>
          </div>
        ))}
      </div>
      <PieChart width={260} height={260}>
        <Pie
          data={data}
          cx={125}
          cy={125}
          innerRadius={75}
          outerRadius={125}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map(({ name, color }) => (
            <Cell key={name} fill={color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value + " laps", name]}
          contentStyle={{
            background: "#0f2557",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 0,
            color: "#fff",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
          }}
        />
      </PieChart>
    </div>
  );
};

export default RidesPieChart;
