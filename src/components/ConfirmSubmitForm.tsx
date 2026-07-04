"use client";

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
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
