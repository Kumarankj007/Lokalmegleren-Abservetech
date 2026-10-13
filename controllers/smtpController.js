import nodemailer from "nodemailer"

const sendMail = async (email, subject, text, html) => {
    let smtpConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    }
    console.log("SMTP Config: ", smtpConfig);

    let mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: subject,
        text: text,
        html: html
    }
    

    let mailTransporter = nodemailer.createTransport(smtpConfig)
    return new Promise((resolve, reject) => {
        mailTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending mail", error);
                return reject(error);
            }
            console.log("Mail sent successfully:", info);
            resolve(info); 
        });
    });
}

export default sendMail 