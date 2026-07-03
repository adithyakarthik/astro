import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/db";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 45;

function hashCode(code: string, email: string): string {
  return createHash("sha256").update(`${email.toLowerCase()}:${code}`).digest("hex");
}

function generateCode(): string {
  return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

export class OtpCooldownError extends Error {
  constructor(public secondsRemaining: number) {
    super(`Please wait ${secondsRemaining}s before requesting another code.`);
  }
}

/** Creates and stores a fresh OTP for the given email, returning the plaintext code to send. */
export async function issueOtp(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();

  const recent = await prisma.otpCode.findFirst({
    where: { email: normalizedEmail },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const secondsSince = (Date.now() - recent.createdAt.getTime()) / 1000;
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      throw new OtpCooldownError(Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince));
    }
  }

  const code = generateCode();
  await prisma.otpCode.create({
    data: {
      email: normalizedEmail,
      codeHash: hashCode(code, normalizedEmail),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });
  return code;
}

/** Verifies a submitted code against the most recent unconsumed OTP for that email. */
export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const candidate = await prisma.otpCode.findFirst({
    where: { email: normalizedEmail, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!candidate) return false;
  if (candidate.expiresAt.getTime() < Date.now()) return false;
  if (candidate.codeHash !== hashCode(code, normalizedEmail)) return false;

  await prisma.otpCode.update({
    where: { id: candidate.id },
    data: { consumedAt: new Date() },
  });
  return true;
}
