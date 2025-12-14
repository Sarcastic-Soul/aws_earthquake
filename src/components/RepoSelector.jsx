import React, { useState } from "react";
import { ChevronDown, Search, Github } from "lucide-react";
import { THEME } from "../theme";

const POPULAR_REPOS = [
  { name: "React", value: "facebook/react" },
  { name: "Next.js", value: "vercel/next.js" },
  { name: "Vue Core", value: "vuejs/core" },
  { name: "TensorFlow", value: "tensorflow/tensorflow" },
  { name: "Linux", value: "torvalds/linux" },
  { name: "AWS SDK", value: "aws/aws-sdk-js" },
];

const RepoSelector = ({ currentRepo, onRepoChange }) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState(currentRepo);
  const [isOpen, setIsOpen] = useState(false);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.includes("/")) {
      onRepoChange(customInput);
      setIsOpen(false);
      setIsCustom(false);
    }
  };

  const getDisplayName = () => {
    const found = POPULAR_REPOS.find((r) => r.value === currentRepo);
    return found ? found.name : currentRepo;
  };

  return (
    <div className="flex items-center gap-2 relative z-20">
      {!isCustom ? (
        <div className="relative group">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 ${THEME.inputBg} px-3 py-2 text-xs font-bold border ${THEME.border} hover:border-[#d79921] transition rounded-sm uppercase min-w-[160px] justify-between text-[#3c3836]`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Github size={14} className="flex-shrink-0" />
              <span className="truncate max-w-[100px]">{getDisplayName()}</span>
            </div>
            <ChevronDown size={14} />
          </button>

          {/* Dropdown Menu */}
          <div
            className={`absolute top-full left-0 w-48 ${THEME.cardBg} border ${THEME.border} shadow-xl ${isOpen ? "block" : "hidden group-hover:block"} pt-1`}
          >
            {POPULAR_REPOS.map((repo) => (
              <button
                key={repo.value}
                onClick={() => {
                  onRepoChange(repo.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 text-xs font-bold hover:bg-[#d79921] hover:text-[#fbf1c7] uppercase ${THEME.textMain}`}
              >
                {repo.name}
              </button>
            ))}
            <div className={`border-t ${THEME.border} p-2`}>
              <button
                onClick={() => setIsCustom(true)}
                className={`w-full text-center text-[10px] font-bold uppercase ${THEME.textSub} hover:text-[#d79921] py-1 border border-transparent hover:border-[#d5c4a1]`}
              >
                + Enter Custom Repo
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleCustomSubmit}
          className="flex items-center animate-in fade-in slide-in-from-left-2 duration-200"
        >
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="owner/repo"
            className={`w-40 px-2 py-1.5 text-xs font-mono border ${THEME.border} ${THEME.bg} focus:outline-none focus:border-[#d79921] text-[#3c3836]`}
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#d79921] text-[#fbf1c7] p-1.5 border border-[#d79921] hover:brightness-90"
          >
            <Search size={14} />
          </button>
          <button
            type="button"
            onClick={() => setIsCustom(false)}
            className="ml-2 text-xs text-[#cc241d] font-bold hover:underline"
          >
            CANCEL
          </button>
        </form>
      )}
    </div>
  );
};

export default RepoSelector;
