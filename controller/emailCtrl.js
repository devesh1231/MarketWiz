const nodemailer = require('nodemailer');
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            // Make sure to replace `user` with your actual Gmail email address
            user: 'deveshpathak67@gmail.com',
            pass: 'lueb vyah dmqe cucz', // Assuming you have your Gmail password in an environment variable
        },
    });

    // async..await is not allowed in the global scope, so you should define your main function and call it
    async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"HEY👻" <abc@gmail.com>', // sender address
            to: data.to, // list of receivers
            subject: data.subject, // Subject line
            text: data.text, // plain text body
            html: data.html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    // Call the main function to send the email
    await main();
});

module.exports = sendEmail;
