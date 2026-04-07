import crypto from "crypto";

export function generateAgreementHash(
  title: string,
  content: string,
  senderId: string,
  receiverId: string,
) {
  const data = `${title}|${content}|${senderId}|${receiverId}`;

  return crypto.createHash("sha256").update(data).digest("hex");
}
