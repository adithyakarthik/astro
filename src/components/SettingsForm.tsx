"use client";

import { useTransition } from "react";
import { updateSettings } from "@/app/settings/actions";

export function SettingsForm({
  defaultTheme,
  defaultChartStyle,
  defaultUseTrueNodes,
  defaultAyanamsa,
  labels,
}: {
  defaultTheme: "light" | "dark";
  defaultChartStyle: "south" | "north";
  defaultUseTrueNodes: boolean;
  defaultAyanamsa: string;
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
    ayanamsa: string;
    ayanamsaLahiri: string;
    ayanamsaRaman: string;
    ayanamsaKrishnamurti: string;
    ayanamsaYukteshwar: string;
    ayanamsaFaganBradley: string;
    ayanamsaNote: string;
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.theme}
        <select name="theme" defaultValue={defaultTheme} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
          <option value="light">{labels.themeLight}</option>
          <option value="dark">{labels.themeDark}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.chartStyle}
        <select
          name="chartStyle"
          defaultValue={defaultChartStyle}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="on">{labels.nodeTrue}</option>
          <option value="off">{labels.nodeMean}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.ayanamsa}
        <select
          name="ayanamsa"
          defaultValue={defaultAyanamsa}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="LAHIRI">{labels.ayanamsaLahiri}</option>
          <option value="RAMAN">{labels.ayanamsaRaman}</option>
          <option value="KRISHNAMURTI">{labels.ayanamsaKrishnamurti}</option>
          <option value="YUKTESHWAR">{labels.ayanamsaYukteshwar}</option>
          <option value="FAGAN_BRADLEY">{labels.ayanamsaFaganBradley}</option>
        </select>
        <span className="mt-0.5 text-xs font-normal text-zinc-400 dark:text-zinc-500">{labels.ayanamsaNote}</span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {labels.save}
      </button>
    </form>
  );
}
