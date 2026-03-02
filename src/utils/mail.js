import Mailgen from "mailgen";
import nodemailer from "nodemailer";

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

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanagement@gmail.com ",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHTML,
  };
try {
  const info = await transporter.sendMail(mail);
  console.log("✅ Email sent:", info.messageId);
} catch (error) {
  console.error("❌ SMTP ERROR:", error);
  throw error;
}
};
console.log({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  user: process.env.MAILTRAP_USER,
});

const emailVerificationMail = (username,verificationUrl)=>{
return{
body:{
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

}
}};



const forgotPasswordEmail = (username,passwordResetUrl)=>{
return{
body:{
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

}
}};

export {emailVerificationMail, forgotPasswordEmail,sendEmail};

// import Mailgen from "mailgen";
// import nodemailer from "nodemailer";

// const sendEmail = async (options) => {
//     console.log("📧 Preparing to send email with options:", options);
//   const mailGenerator = new Mailgen({
//     theme: "default",
//     product: {
//       name: "Project Management System",
//       link: "http://TaskManagementSystem.com",
//     },
//   });

//   // Generate email content
//   const emailHTML = mailGenerator.generate(options);
//   const emailTextual = mailGenerator.generatePlaintext(options);

//   console.log("📧sending to:", options.body.email);
//   // Mailtrap transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.MAILTRAP_HOST,
//     port: process.env.MAILTRAP_PORT,
//     secure: false,
//     auth: {
//       user: process.env.MAILTRAP_USER,
//       pass: process.env.MAILTRAP_PASS,
//     },
//   });

//   const mail = {
//     from: process.env.EMAIL,
//     to: options.body.email,   // ⭐ IMPORTANT
//     subject: options.subject,
//     text: emailTextual,
//     html: emailHTML,
//   };
// console.log("📧 Email content prepared:", { mail });
//   await transporter.sendMail(mail);
//   console.log("📧 Email sent successfully ");
// };



// // ================= EMAIL TEMPLATES =================

// const emailVerificationMail = (username, email, verificationUrl) => {
//   return {
//     subject: "Verify Your Email",
//     body: {
//       name: username,
//       intro:
//         "Welcome to our Project Management System! We're excited to have you onboard.",
//       action: {
//         instructions: "Click the button below to verify your email:",
//         button: {
//           color: "#22BC66",
//           text: "Verify Email",
//           link: verificationUrl,
//         },
//       },
//       outro:
//         "If you did not create this account, no further action is required.",
//       email: email, // ⭐ REQUIRED FOR MAILTRAP
//     },
//   };
// };

// const forgotPasswordEmail = (username, email, resetUrl) => {
//   return {
//     subject: "Reset Your Password",
//     body: {
//       name: username,
//       intro: "You requested to reset your password.",
//       action: {
//         instructions: "Click below to reset:",
//         button: {
//           color: "#aa3ca5",
//           text: "Reset Password",
//           link: resetUrl,
//         },
//       },
//       outro:
//         "If you didn't request this, you can safely ignore this email.",
//       email: email,
//     },
//   };
// };

// export { sendEmail, emailVerificationMail, forgotPasswordEmail };