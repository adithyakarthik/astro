import { createClient } from "../actions";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Add client</h1>
      <p className="mt-1 text-zinc-600">
        Store the client&apos;s contact details. You can add one or more kundlis (birth charts) for them next.
      </p>

      <form action={createClient} className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Full name *
          <input name="name" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Phone
          <input name="phone" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input name="email" type="email" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Notes
          <textarea name="notes" rows={3} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Save client
        </button>
      </form>
    </div>
  );
}
