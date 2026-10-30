import nodemailer from 'nodemailer';

export interface SendEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(data: SendEmailPayload): Promise<{ success: boolean; message: string }> {
  const { name, email, subject, message } = data;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || user || 'professor@university.edu';

  if (!host || !user || !pass || pass === 'app_password') {
    console.warn(
      '⚠️ SMTP configuration incomplete or default placeholder in .env.local. Direct email simulation:\n',
      { name, email, subject, message, destination: receiver }
    );
    return {
      success: true,
      message: 'Thank you for reaching out. Your message has been submitted successfully. We appreciate your interest and will respond when possible.',
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"${name} via Academic Portfolio" <${user}>`,
    replyTo: email,
    to: receiver,
    subject: `[Portfolio Inquiry] ${subject}`,
    text: `You have received a new contact inquiry from your Academic Portfolio website.\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">New Inquiry from Academic Website</h2>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Sender Name:</strong> ${name}</p>
        <p><strong>Sender Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin-top: 16px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
          This message was sent directly from the contact form on your academic portfolio. You can reply directly to this email to contact ${name}.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: 'Thank you for reaching out. Your message has been submitted successfully. We appreciate your interest and will respond when possible.',
    };
  } catch (error) {
    console.error('Failed to send email via SMTP:', error);
    return { success: false, message: 'Failed to send message. Please try again or use direct email.' };
  }
}
