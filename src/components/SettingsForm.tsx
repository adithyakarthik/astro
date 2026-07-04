"use client";

import { useTransition } from "react";
import { updateSettings } from "@/app/settings/actions";

export function SettingsForm({
  defaultTheme,
  defaultChartStyle,
  defaultUseTrueNodes,
  labels,
}: {
  defaultTheme: "light" | "dark";
  defaultChartStyle: "south" | "north";
  defaultUseTrueNodes: boolean;
  labels: {
    theme: string;
    themeLight: string;
    themeDark: string;
    chartStyle: string;
    chartStyleSouth: string;
    chartStyleNorth: string;
    nodeType: string;
    nodeTrue: string;
    nodeMean: string;
    save: string;
  };
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateSettings(formData);
      // Theme/chart-style affect the root layout and every chart view — a
      // full reload guarantees they re-render everywhere, avoiding the same
      // stale Router Cache issue the language switcher works around.
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.theme}
        <select name="theme" defaultValue={defaultTheme} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          <option value="light">{labels.themeLight}</option>
          <option value="dark">{labels.themeDark}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.chartStyle}
        <select
          name="chartStyle"
          defaultValue={defaultChartStyle}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="south">{labels.chartStyleSouth}</option>
          <option value="north">{labels.chartStyleNorth}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.nodeType}
        <select
          name="useTrueNodes"
          defaultValue={defaultUseTrueNodes ? "on" : "off"}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="on">{labels.nodeTrue}</option>
          <option value="off">{labels.nodeMean}</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {labels.save}
      </button>
    </form>
  );
}
