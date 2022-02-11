const nodemailer = require('nodemailer');

const sendEmail = async options => {
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: 'Atuhaire Collins <collinsbenda360@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //,html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
// const sendEmail = options => {
//   //1.create a transporter
//   // const transporter = nodemailer.createTransporter({
//   //     service: 'Gmail',
//   //     auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD
//   //     }
//   //     //activate in gmail "less secure app" option
//   // });

//   //2.defineemail options
//   //3.send email
// };
