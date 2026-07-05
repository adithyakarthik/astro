"use client";

import { useRef } from "react";
import { ALL_MODULES, MODULE_LABELS, TIER_KEYS, TIER_LABELS, TIER_MODULE_PRESETS, type ModuleKey, type TierKey } from "@/lib/auth/modules";

export function TierModulesForm({
  action,
  defaultTier,
  enabledModules,
  disabled,
  labels,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultTier: TierKey;
  enabledModules: ModuleKey[];
  disabled: boolean;
  labels: { tier: string; save: string };
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function applyPreset(tier: TierKey) {
    const form = formRef.current;
    if (!form) return;
    const preset = TIER_MODULE_PRESETS[tier];
    for (const key of ALL_MODULES) {
      const input = form.elements.namedItem(`module-${key}`) as HTMLInputElement | null;
      if (input) input.checked = preset.includes(key);
    }
  }

  return (
    <form ref={formRef} action={action} className="mt-3 flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-1.5 text-sm font-medium">
        {labels.tier}
        <select
          name="tier"
          defaultValue={defaultTier}
          disabled={disabled}
          onChange={(e) => applyPreset(e.target.value as TierKey)}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {TIER_KEYS.map((tier) => (
            <option key={tier} value={tier}>
              {TIER_LABELS[tier]}
            </option>
          ))}
        </select>
      </label>
      {ALL_MODULES.map((moduleKey) => (
        <label key={moduleKey} className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name={`module-${moduleKey}`} defaultChecked={enabledModules.includes(moduleKey)} disabled={disabled} />
          {MODULE_LABELS[moduleKey]}
        </label>
      ))}
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-40"
      >
        {labels.save}
      </button>
    </form>
  );
}
