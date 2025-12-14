import React from "react";
import { THEME } from "../theme";

const StatsCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div
    className={`p-6 ${THEME.cardBg} border ${THEME.border} shadow-sm rounded-sm flex flex-col justify-between h-full hover:border-[#bdae93] transition-colors`}
  >
    <div className="flex items-center justify-between mb-2">
      <h3
        className={`text-xs font-bold uppercase tracking-widest ${THEME.textSub}`}
      >
        {title}
      </h3>
      {Icon && <Icon className={`w-4 h-4 ${colorClass}`} />}
    </div>
    <div>
      <div className={`text-3xl font-black ${THEME.textMain} tracking-tighter`}>
        {value}
      </div>
      {subtext && (
        <p className={`mt-1 text-[10px] ${THEME.textSub} font-mono uppercase`}>
          {subtext}
        </p>
      )}
    </div>
  </div>
);

export default StatsCard;
