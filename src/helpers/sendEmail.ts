import nodemailer, { Transporter } from 'nodemailer';

interface EmailData {
    otp?: string
}

interface EmailContent {
    subject: string;
    text: string;
}

const generateEmailContent = (type: string, data?: EmailData): EmailContent => {
    switch (type) {
        case "OTP for verifing email":
            return {
                subject: 'OTP for verifing email',
                text: `Your OTP code is ${data?.otp}. Please use this code to verify your email.
                
                `
            };
        case "OTP for Reset Password":
            return {
                subject: "Password Reset Request",
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
               Please click on the following link, or paste this into your browser to complete the process:\n\n
               ${data?.otp}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };
        case 'admin verification':
            return {
                subject: 'Admin Verification',
                text: `You have been verified by the super admin. You can now access the admin panel.`
            };
        case 'super admin verification':
            return {
                subject: 'Super Admin Verification',
                text: `You have been became super admin by the super admin. You can now access the admin panel and also do all activictys.`
            };
        default:
            return {
                subject: '',
                text: '',
            };
    }
}

export const sendEmail = async (to: string, type: string, data?: EmailData) => {
    // console.log(to, type, data);

    const { subject, text } = generateEmailContent(type, data);

    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        },
    });

    const mailOptions = {
        from: `"Exam Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (info.response) {
            return Response.json(
                {
                    success: true,
                    message: "email send successfully"
                },
                {
                    status: 200
                }
            )
        }


    } catch (error) {
        console.error('Error sending email:', error);
    }
}