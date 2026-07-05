"use server";

import { redirect } from "next/navigation";
import { issueOtp, verifyOtp, OtpCooldownError } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/auth/email";
import { createPortalSession, findPortalEligibleClients } from "@/lib/auth/portal-session";

export async function requestPortalOtp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !email.includes("@")) {
    redirect(`/portal/login?error=${encodeURIComponent("Enter a valid email address")}`);
  }

  let code: string;
  try {
    code = await issueOtp(email);
  } catch (err) {
    if (err instanceof OtpCooldownError) {
      redirect(`/portal/login/verify?email=${encodeURIComponent(email)}&notice=${encodeURIComponent(err.message)}`);
    }
    throw err;
  }

  const { devFallback } = await sendOtpEmail(email, code);
  const params = new URLSearchParams({ email });
  if (devFallback) params.set("devCode", code);
  redirect(`/portal/login/verify?${params.toString()}`);
}

export async function resendPortalOtp(formData: FormData) {
  await requestPortalOtp(formData);
}

export async function verifyPortalOtpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  const ok = await verifyOtp(email, code);
  if (!ok) {
    redirect(
      `/portal/login/verify?email=${encodeURIComponent(email)}&error=${encodeURIComponent("Invalid or expired code — try again or resend.")}`
    );
  }

  const eligible = await findPortalEligibleClients(email);
  if (eligible.length === 0) {
    redirect(
      `/portal/login?error=${encodeURIComponent("No active portal access found for this email. Ask your astrologer to enable it for you.")}`
    );
  }

  // Rare edge case: the same email has active portal access under more than
  // one astrologer on this platform. Defaults to the oldest grant rather
  // than building a full account-picker for an unlikely scenario.
  const chosen = [...eligible].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
  await createPortalSession(chosen.id);
  redirect("/portal");
}
