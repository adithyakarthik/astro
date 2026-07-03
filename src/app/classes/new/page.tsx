import { createClass } from "../actions";

export default function NewClassPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Announce a class</h1>
      <p className="mt-1 text-zinc-600">
        Fill in your UPI ID once — a payment link and QR code are generated automatically for students to pay you
        directly.
      </p>

      <form action={createClass} className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Class title *
          <input name="title" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea name="description" rows={2} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Date & time *
            <input
              name="startsAt"
              type="datetime-local"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Duration (mins)
            <input
              name="durationMins"
              type="number"
              defaultValue={60}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Fee (₹) *
          <input
            name="feeInRupees"
            type="number"
            step="1"
            min="0"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Your UPI ID *
          <input
            name="upiId"
            required
            placeholder="yourname@okaxis"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Payee name (shown to payer) *
          <input name="payeeName" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Meeting link (Zoom/Google Meet, optional)
          <input name="meetingLink" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Announce class
        </button>
      </form>
    </div>
  );
}
