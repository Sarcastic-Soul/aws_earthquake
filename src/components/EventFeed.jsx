import React from "react";
import { format } from "date-fns";
import { THEME } from "../theme.js";

const EventFeed = ({ items, loading }) => (
  <div
    className={`md:col-span-1 ${THEME.cardBg} border ${THEME.border} flex flex-col h-[400px] shadow-sm rounded-sm`}
  >
    <div
      className={`p-4 border-b ${THEME.border} bg-[#e0cfa9] flex justify-between items-center rounded-t-sm`}
    >
      <h3
        className={`font-bold text-xs uppercase tracking-widest ${THEME.textSub}`}
      >
        Live Event Log
      </h3>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#98971a] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#98971a]"></span>
      </span>
    </div>

    <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
      {loading ? (
        <div className={`p-6 text-xs font-mono ${THEME.textSub} text-center`}>
          Synchronizing satellite data...
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className={`p-4 border-b ${THEME.border} hover:bg-[#fbf1c7] transition-colors group cursor-default`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider text-[#fbf1c7] rounded-sm ${item.type === "commit" ? "bg-[#458588]" : "bg-[#cc241d]"}`}
              >
                {item.type === "commit" ? "GIT" : "GEO"}
              </span>
              <span className={`text-[10px] font-mono ${THEME.textSub}`}>
                {format(new Date(item.date), "MM/dd HH:mm")}
              </span>
            </div>
            <p
              className={`text-xs font-medium ${THEME.textMain} line-clamp-2 leading-relaxed mt-1`}
            >
              {item.desc}
            </p>
          </div>
        ))
      )}
      {!loading && items.length === 0 && (
        <div className="p-6 text-center text-xs text-gray-500 font-mono">
          No events found in this period.
        </div>
      )}
    </div>
  </div>
);

export default EventFeed;
