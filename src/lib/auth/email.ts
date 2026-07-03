// Sends the OTP login code by email via Resend (https://resend.com — free
// tier, no SDK needed, just an API key) if configured. Falls back to
// logging the code to the server console when RESEND_API_KEY isn't set, so
// login works out of the box in local/dev use before you've set up email.
//
// To go live: sign up at resend.com, verify a sending domain (or use their
// shared onboarding domain for testing), and set RESEND_API_KEY +
// RESEND_FROM_EMAIL in your environment.

export interface SendOtpResult {
  /** True if no email provider is configured and the code was only logged to the server console. */
  devFallback: boolean;
}

export async function sendOtpEmail(email: string, code: string): Promise<SendOtpResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.log(`[dev-mode] OTP login code for ${email}: ${code} (valid 10 minutes)`);
    return { devFallback: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: email,
      subject: "Your login code",
      text: `Your login code is ${code}. It expires in 10 minutes.`,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to send OTP email (${response.status}): ${body}`);
  }

  return { devFallback: false };
}
