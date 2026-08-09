import type { Transporter, SendMailOptions } from 'nodemailer';
import { createTransporter, defaultMailOptions } from '../config/email.config.js';
import type { EmailOptions, InvoiceEmailOptions } from '../interfaces/email.interface.js';
import logger from '../libs/logger.lib.js';
import { AppError } from '../middlewares/error.middleware.js';
import { env } from '../config/env.js';

import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export class EmailService {
    private transporter: Transporter;
    constructor() {
        this.transporter = createTransporter();
    }

    //verifier la connexion
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            logger.info('Email service connected successfully');
            return true;
        } catch (error) {
            logger.error('Email service connection failed', { error });
            throw new AppError('Impossible de se connecter au service email', 500);
        }
    }

    //Envoyer un email
    async sendEmail(options: EmailOptions): Promise<any> {
        try {
            const mailOptions: SendMailOptions = {
                from: defaultMailOptions.from,
                to: options.to,
                subject: options.subject || defaultMailOptions.subject,
                html: options.html,
                attachments: options.attachments,
                cc: options.cc,
                bcc: options.bcc
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info('Email sent successfully', {
                to: options.to,
                subject: mailOptions.subject,
                messageId: info.messageId
            });

            return info;
        } catch (error) {
            logger.error('Failed to send email', { error, to: options.to });
            throw new AppError('Échec de l\'envoi de l\'email', 500);
        }


    }

    //Envoyer une facture par email
    async sendInvoiceEmail(options: InvoiceEmailOptions): Promise<any> {
        try {
            //verifier que le PDF existe 
            await fs.access(options.pdfPath);

            //Generer le HTML  de l'email
            const emailHtml = await this.generateInvoiceEmailHTML({
                invoiceNumber: options.invoiceNumber,
                clientEmail: options.clientEmail,
                invoiceId: options.invoiceId
            });

            // Préparer les pièces jointes
            const attachments = [
                {
                    filename: options.pdfFilename || `invoice-${options.invoiceNumber}.pdf`,
                    path: options.pdfPath,
                    contentType: 'application/pdf'
                }
            ];

            // Envoyer l'email
            const result = await this.sendEmail({
                to: options.to,
                subject: options.subject || `Facture #${options.invoiceNumber}`,
                html: emailHtml,
                attachments: attachments
            });

            logger.info('Invoice email sent successfully', {
                invoiceId: options.invoiceId,
                invoiceNumber: options.invoiceNumber,
                to: options.to
            });

            return result;

        } catch (error) {
            if (error instanceof AppError) throw error;
            
            logger.error('Failed to send invoice email', {
                error,
                invoiceId: options.invoiceId,
                to: options.to
            });
            
            throw new AppError('Échec de l\'envoi de la facture par email', 500);
        }
    }

    // Methode pour generer le HML de l'email
    private async generateInvoiceEmailHTML(data: {
        invoiceNumber: string;
        clientEmail: string;
        invoiceId: string;
    }): Promise<string> {
        try {
            //template email
            const template = `
            <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre facture #{{invoiceNumber}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            font-size: 28px;
            margin: 0;
        }
        .header .subtitle {
            color: #7f8c8d;
            font-size: 14px;
            margin-top: 4px;
        }
        .content {
            margin: 30px 0;
        }
        .content p {
            color: #2c3e50;
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .invoice-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
            border-left: 4px solid #2c3e50;
        }
        .invoice-details .label {
            color: #7f8c8d;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .invoice-details .value {
            color: #2c3e50;
            font-size: 16px;
            font-weight: 500;
            margin-top: 4px;
        }
        .button {
            display: inline-block;
            background: #2c3e50;
            color: #ffffff !important;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background: #1a252f;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            color: #95a5a6;
            font-size: 13px;
        }
        .footer .brand {
            color: #2c3e50;
            font-weight: 600;
        }
        .highlight {
            color: #3498db;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📄 Facture</h1>
            <div class="subtitle">Invoice</div>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>{{clientEmail}}</strong>,</p>
            <p>Nous vous remercions pour votre confiance. Veuillez trouver ci-joint votre facture.</p>
            
            <div class="invoice-details">
                <div class="label">Numéro de facture / Invoice Number</div>
                <div class="value">#{{invoiceNumber}}</div>
            </div>
            
            <div style="text-align: center;">
                <a href="{{downloadUrl}}" class="button">📥 Télécharger la facture</a>
            </div>
            <p style="text-align: center; font-size: 14px; color: #95a5a6;">
                Ou consultez votre facture dans votre espace client.
            </p>
        </div>
        
        <div class="footer">
            <p>
                <span class="brand">Merci pour votre confiance</span> • 
                Thank you for your trust
            </p>
            <p style="font-size: 11px;">
                Cette facture est générée automatiquement. En cas de question, contactez-nous.<br>
                This invoice is automatically generated. For any questions, please contact us.
            </p>
        </div>
    </div>
</body>
</html>
            `;
            //Compiler avec Handlebars
            const compiled = Handlebars.compile(template);
            const html = compiled({
                invoiceNumber: data.invoiceNumber,
                clientEmail: data.clientEmail,
                downloadUrl: `${env.appUrl || 'http://localhost:9000'}/invoices/${data.invoiceId}/download`
            });

            return html;
        } catch (error) {
            logger.error('Failed to generate email HTML', { error });
            // Fallback: email simple
            return `
                <h1>Facture #${data.invoiceNumber}</h1>
                <p>Bonjour ${data.clientEmail},</p>
                <p>Veuillez trouver ci-joint votre facture.</p>
                <p>Merci pour votre confiance.</p>
            `;
        }
    }

    //Envoyer plusieurs facturs par email
    async sendMultipleInvoiceEmails(invoices: Array<{
        invoiceId: string;
            invoiceNumber: string;
            clientEmail: string;
            pdfPath: string;
            pdfFilename?: string;
        }>
    ):Promise<Array<{ invoiceId: string; success: boolean; error?: string}>> {
        const results = [];
        for (const invoice of invoices) {
            try {
                await this.sendInvoiceEmail({
                    to: invoice.clientEmail,
                    invoiceId: invoice.invoiceId,
                    invoiceNumber: invoice.invoiceNumber,
                    clientEmail: invoice.clientEmail,
                    pdfPath: invoice.pdfPath,
                    pdfFilename: invoice.pdfFilename,
                    subject: `Facture #${invoice.invoiceNumber}`
                })

                results.push({
                    invoiceId: invoice.invoiceId,
                    success: true
                });
            } catch (error) {
                results.push({
                    invoiceId: invoice.invoiceId,
                    success: false,
                    error: error instanceof AppError ? error.message : 'Unknown error'
                });
            }
        }
        return results;
    }
}

export default EmailService;
