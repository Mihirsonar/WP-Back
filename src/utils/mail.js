import Mailgen from "mailgen";
import { Resend } from "resend";

// Initialize Resend with your API key from environment variables
const resend = new Resend("re_1ADN6waz_9po7B1MSwpMg9mUSF8TcX6DE");

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Project Management System",
      link: "http://TaskManagementSystem.com",
    },
  });

  const emailHTML = mailGenerator.generate(options.mailgencontent);
  const emailTextual = mailGenerator.generatePlaintext(options.mailgencontent);

  try {
    const { data, error } = await resend.emails.send({
      // Replace with your verified domain in production (e.g., info@yourdomain.com)
      from: "Project Management <onboarding@resend.dev>", 
      to: options.email,
      subject: options.subject,
      text: emailTextual,
      html: emailHTML,
    });

    if (error) {
      throw error;
    }

    console.log("✅ Email sent via Resend:", data.id);
    return data;
  } catch (error) {
    console.error("❌ RESEND ERROR:", error);
    throw error;
  }
};

const emailVerificationMail = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our project management system! We're excited to have you on board.",
      action: {
        instructions: "Click the button below to verify your email address:",
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: verificationUrl,
        },
      },
      outro: "If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.",
    },
  };
};

const forgotPasswordEmail = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "You have requested to reset your password.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#aa3ca5",
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro: "If you did not request a password reset, no further action is required. If you have any questions, feel free to contact our support team.",
    },
  };
};

export { emailVerificationMail, forgotPasswordEmail, sendEmail };
