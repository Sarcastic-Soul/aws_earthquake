import React from "react";
import { format } from "date-fns";
import { THEME } from "../theme";

const DualLineChart = ({ data, view }) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={`h-64 flex items-center justify-center text-xs ${THEME.textSub} font-mono bg-[#ebdbb2] bg-opacity-20`}
      >
        NO DATA POINTS AVAILABLE
      </div>
    );
  }

  const height = 200;
  const width = 1000;
  const padding = 20;

  const maxCommits = Math.max(...data.map((d) => d.commits), 1);
  const maxQuakes = Math.max(...data.map((d) => d.quakes), 1);

  const createPath = (key, maxVal) => {
    return data
      .map((point, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y =
          height - padding - (point[key] / maxVal) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const commitPath = createPath("commits", maxCommits);
  const quakePath = createPath("quakes", maxQuakes);

  return (
    <div className="w-full h-64 relative group cursor-crosshair select-none">
      <div
        className={`absolute top-2 right-2 text-[10px] font-mono ${THEME.cardBg} p-2 border ${THEME.border} shadow-sm z-10 pointer-events-none opacity-90`}
      >
        <div className="flex items-center gap-2 text-[#458588] font-bold">
          <span className="w-2 h-2 bg-[#458588]"></span> CODE COMMITS
        </div>
        <div className="flex items-center gap-2 text-[#cc241d] font-bold">
          <span className="w-2 h-2 bg-[#cc241d]"></span> EARTHQUAKES
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#d5c4a1"
          strokeWidth="1"
        />

        <polyline
          fill="none"
          stroke={THEME.quakeColor}
          strokeWidth="2"
          strokeLinejoin="round"
          points={quakePath}
          className="transition-all duration-1000 ease-in-out"
        />

        <polyline
          fill="none"
          stroke={THEME.commitColor}
          strokeWidth="3"
          strokeLinejoin="round"
          points={commitPath}
          className="transition-all duration-1000 ease-in-out"
        />

        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 6) === 0) {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            return (
              <text
                key={i}
                x={x}
                y={height + 20}
                fontSize="18"
                fill="#7c6f64"
                textAnchor="middle"
                className="font-mono font-bold"
              >
                {view === "24h"
                  ? format(new Date(d.timestamp), "HH:mm")
                  : format(new Date(d.timestamp), "MMM dd")}
              </text>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

export default DualLineChart;
