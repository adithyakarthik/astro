"use client";

import { useTransition } from "react";

/**
 * Wraps a server action that redirects back to an already-visited page.
 * Next's client Router Cache can serve a stale render of the destination
 * right after such a redirect (same issue the language switcher works
 * around) — forcing a full reload after the action resolves guarantees the
 * page reflects what was just saved.
 */
export function ActionForm({
  action,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void> | void;
  className?: string;
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className} aria-busy={isPending}>
      {children}
    </form>
  );
}
