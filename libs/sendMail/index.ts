import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ejs from 'ejs';
import path from 'path';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const renderEmailTemplate = (templateName: string, data: Record<string, any>): string => {
  const templatePath = path.join(
    process.cwd(),
    "auth-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );
  return ejs.render(templatePath, data, )
}

export const sendMail = async (to: string, subject: string, templateName: string, data: Record<string, any>):Promise<string> => {
  try {
    const html = renderEmailTemplate(templateName, data);

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return 'Email sent successfully';
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}
