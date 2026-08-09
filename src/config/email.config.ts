import { env } from "./env.js";
import nodemailer from "nodemailer";

//Mailtrap configuration
export const mailConfig = {
    host: env.smtp.host,
    port: env.smtp.port,
    auth: {
        user: env.smtp.user,
        pass: env.smtp.pass
    }
};

//transporteur
export const createTransporter = () =>{
    return nodemailer.createTransport(mailConfig);
};

//configuration par defaut
export const defaultMailOptions = {
    from: env.smtp.emeilFrom || 'noreply@invoice.com',
    subject: 'Votre facture / Your Invoice'
}