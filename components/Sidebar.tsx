import React from 'react';
import { CATEGORIES, ICONS, AD_CONFIG } from '../constants.tsx';
import { Category } from '../types';
import AdUnit from './AdUnit';
import logo from '/assets/logo.png';

type EditionKey = "us_world" | "us" | "in" | "uk" | "global";

interface SidebarProps {
  activeCategory: Category;
  onSelectCategory: (c: Category) => void;
  className?: string;
  bookmarksCount: number;

  // NEW
  edition: EditionKey;
  onChangeEdition: (edition: EditionKey) => void;
}

const EDITION_OPTIONS: { key: EditionKey; label: string }[] = [
  { key: "us_world", label: "US & World" },
  { key: "us", label: "US only" },
  { key: "global", label: "Global" },
  { key: "in", label: "India" },
  { key: "uk", label: "UK" },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onSelectCategory,
  className = "",
  bookmarksCount,
  edition,
  onChangeEdition,
}) => {
  return (
    <div
      className={`w-64 flex-shrink-0 flex flex-col h-[calc(100vh-5rem)] sticky top-20 pl-8 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent ${className}`}
    >
      {/* Edition / Country Filter */}
      <div className="mb-10">
        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-3">
          Edition
        </h3>
        <div className="flex flex-wrap gap-2 pr-6">
          {EDITION_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onChangeEdition(opt.key)}
              className={[
                "px-3 py-1 text-[10px] uppercase tracking-[0.16em] border transition-all",
                edition === opt.key
                  ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-neutral-500",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections / Categories */}
      <div className="mb-12">
        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-8">
          Sections
        </h3>
        <nav className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`group flex items-center justify-between py-2 text-sm transition-all duration-300 ${activeCategory === cat
                ? "text-primary translate-x-2"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`transition-opacity ${activeCategory === cat
                    ? "opacity-100"
                    : "opacity-40 group-hover:opacity-100"
                    }`}
                >
                  {ICONS[cat]}
                </span>
                <span
                  className={`font-serif ${activeCategory === cat ? "font-medium italic" : ""
                    }`}
                >
                  {cat}
                </span>
              </div>
              {activeCategory === cat && (
                <span className="w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto pb-8 pr-6">
        <AdUnit
          slot={AD_CONFIG.slots.sidebar}
          format="vertical"
          className="w-full"
          lazy={true}
          minHeight="600px"
        />

        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 text-neutral-900 dark:text-neutral-100">
              <img
                src={logo}
                alt="The Intellectual Brief Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-serif italic text-neutral-800 dark:text-neutral-200 text-sm">
              Intellectual Brief
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 leading-relaxed font-mono">
            Market Intelligence & <br />
            Strategic Analysis. <br />
            © 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
