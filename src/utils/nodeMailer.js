import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config();

class NodeMailer {
    transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.google.com',
            port: 465,
            secure: true,
            auth: { //from which account you want to send email and pass is not of gmail pass we will generate this password
                user: process.env.ID,
                pass: process.env.PASSWORD
            }
        })
    }

    async sendMail(reciverEmail, otp){
        try {
            await this.transporter.sendMail({
                from: process.env.ID, // sender address
                to: reciverEmail, // list of receivers
                subject: "OTP Verification", // Subject line
                html: `<p>Correct login details! Please enter the OTP fro verification. OTP is <b>${otp}</b></p> `, // html body
            })
        } catch (error) {
            console.log(error)
        }
        
    }

}

const nodeMailer = new NodeMailer()

export default nodeMailer;