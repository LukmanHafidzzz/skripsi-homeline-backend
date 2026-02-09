import nodemailer from "nodemailer";

export const sendResetEmail = async (email, resetLink, username) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Homeline Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Password Homeline",
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Reset Password Homeline</h2>
                <p>Halo ${username},</p>
                <p>Kami menerima permintaan untuk reset password akun Anda.</p>
                <p>Silakan klik tombol di bawah ini:</p>
                
                <a href="${resetLink}" 
                    style="
                        background-color:#7A5B46;
                        color:white;
                        padding:10px 20px;
                        text-decoration:none;
                        border-radius:5px;
                        display:inline-block;
                    ">
                    Reset Password
                </a>

                <p style="margin-top:20px;">
                    Link ini berlaku selama 15 menit.
                </p>

                <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>

                <br/>
                <p>Homeline Team</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};
