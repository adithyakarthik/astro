/**
 * Builds a UPI deep link following the standard `upi://pay` intent spec
 * supported by GPay, PhonePe, Paytm, BHIM and all NPCI-compliant UPI apps.
 * Opening this link on a phone prompts the user to pick a UPI app and
 * pay directly — no payment gateway or merchant account needed.
 */
export function buildUpiLink(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  note: string;
  referenceId?: string;
}): string {
  const query = new URLSearchParams({
    pa: params.upiId,
    pn: params.payeeName,
    am: params.amount.toFixed(2),
    cu: "INR",
    tn: params.note,
  });
  if (params.referenceId) query.set("tr", params.referenceId);
  return `upi://pay?${query.toString()}`;
}
