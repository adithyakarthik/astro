"use server";

import { redirect } from "next/navigation";
import { issueOtp, verifyOtp, OtpCooldownError } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/auth/email";
import { findOrCreateUser, createSession } from "@/lib/auth/session";

export async function requestOtp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = String(formData.get("next") ?? "/");

  if (!email || !email.includes("@")) {
    redirect(`/login?error=${encodeURIComponent("Enter a valid email address")}&next=${encodeURIComponent(next)}`);
  }

  let code: string;
  try {
    code = await issueOtp(email);
  } catch (err) {
    if (err instanceof OtpCooldownError) {
      redirect(
        `/login/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&notice=${encodeURIComponent(err.message)}`
      );
    }
    throw err;
  }

  const { devFallback } = await sendOtpEmail(email, code);
  const params = new URLSearchParams({ email, next });
  if (devFallback) params.set("devCode", code);
  redirect(`/login/verify?${params.toString()}`);
}

export async function resendOtp(formData: FormData) {
  await requestOtp(formData);
}

export async function verifyOtpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const next = String(formData.get("next") ?? "/") || "/";

  const ok = await verifyOtp(email, code);
  if (!ok) {
    redirect(
      `/login/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&error=${encodeURIComponent("Invalid or expired code — try again or resend.")}`
    );
  }

  const user = await findOrCreateUser(email);
  await createSession(user.id);
  redirect(next);
}
