"use client";

import { useTransition } from "react";

export function ConfirmSubmitForm({
  action,
  confirmMessage,
  label,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  label: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm(confirmMessage)) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
      // Deletes typically redirect back to an already-visited list/detail
      // page — a full reload guarantees it reflects the deletion instead of
      // a stale Router Cache render (same issue the language switcher and
      // edit forms work around).
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isPending}>
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
