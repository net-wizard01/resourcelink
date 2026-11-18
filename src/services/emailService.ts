import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `http://localhost:3001/verify-email?token=${token}`;
  
  console.log(`Attempting to send real email to ${email}...`);

  try {
    await transporter.sendMail({
      from: '"ResourceLink" <${process.env.SMTP_USER}>',
      to: email,
      subject: 'Verify your ResourceLink account',
      html: `
        <h2>Welcome to ResourceLink!</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
    console.log(`? Verification email successfully sent to ${email}`);
  } catch (error) {
    console.error("? Email send failed:", error);
  }
};
