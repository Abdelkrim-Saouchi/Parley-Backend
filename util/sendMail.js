const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.SENDER_MAIL_PSW,
  },
});

async function sendMail(userMail, fullName, verificationCode) {
  const info = await transporter.sendMail({
    from: `"Parley Technical support" <${process.env.SENDER_MAIL}>`,
    to: userMail,
    subject: "Email Verification",
    html: `<h5>Hello, ${fullName}</h5>
          <p>Please activate your account by using this code:</p>
          <p><b>${verificationCode}</b></p>
`,
  });

  console.log("message sent:", info.messageId);
}

module.exports = sendMail;
