import React from "react";

export const THEME = {
  bg: "bg-[#fbf1c7]", // Gruvbox Light Hard
  cardBg: "bg-[#f2e5bc]", // Gruvbox Light Soft
  inputBg: "bg-[#ebdbb2]",
  textMain: "text-[#3c3836]", // Dark Charcoal
  textSub: "text-[#7c6f64]", // Light Grey
  border: "border-[#d5c4a1]", // Beige darker
  commitColor: "#458588", // Teal
  quakeColor: "#cc241d", // Red
  accent: "text-[#d79921]", // Yellow
  scrollbarTrack: "#fbf1c7",
  scrollbarThumb: "#d5c4a1",
};

// Global CSS to force scrollbar styling and font smoothing
export const GlobalStyles = () => (
  <style>{`
    body {
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    /* Webkit Scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: ${THEME.scrollbarTrack}; }
    ::-webkit-scrollbar-thumb { background: ${THEME.scrollbarThumb}; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #928374; }
    /* Firefox Scrollbar */
    * { scrollbar-width: thin; scrollbar-color: ${THEME.scrollbarThumb} ${THEME.scrollbarTrack}; }
  `}</style>
);
