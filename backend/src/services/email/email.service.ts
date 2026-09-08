import { Resend } from "resend";
import { readFileSync } from "fs";

const resend = new Resend(process.env.RESEND_API_KEY);
const template = readFileSync("src/services/email/templates/resetPassword.html", "utf-8");

export async function sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<void> {
   const html = template.replace("{{resetString}}", resetToken);

   const { data, error } = await resend.emails.send({
      from: "no-reply@big-beills-kitchen.ca",
      to: toEmail,
      subject: "Password Reset - Big Beill's Kitchen",
      html,
   });
   

   if (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
   }
}