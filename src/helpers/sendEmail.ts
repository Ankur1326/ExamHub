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
        case "OTP for forgot password":
            return {
                subject: "OTP for forgot password",
                text: `Your OTP code is ${data?.otp} to change password.
                `
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
        from: `"CEDEP Institute" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                throw new Error('Failed to send email');
            } else {
                console.log('Email sent successfully:', info.response);
                // Assuming `res` and `ApiResponse` are available in this context
                // res.status(200).json(new ApiResponse(200, null, 'OTP sent successfully'));
            }
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}