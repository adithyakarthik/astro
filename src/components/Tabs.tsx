"use client";

import { useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

export function Tabs({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 print:hidden dark:border-zinc-800">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`-mb-px flex items-center gap-1.5 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-500"
                  : "border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {tab.icon && <span aria-hidden>{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="pt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={tab.id === active ? "flex flex-col gap-6" : "hidden print:flex print:flex-col print:gap-6"}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
