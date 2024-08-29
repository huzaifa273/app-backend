import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const email_service_provider = process.env.EMAIL_SERVICE_PROVIDER || "sandbox.smtp.mailtrap.io"
const email_address = process.env.EMAIL_USER
const email_password = process.env.EMAIL_PASS

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  try {
    var transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "017be1ca9487eb",
          pass: "412321432acb17"
        }
      });

    const mailOptions = {
      from: 'no-reply@aegis.com',
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Could not send email');
  }
};
