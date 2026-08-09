// Interface pour les options d'email
export interface EmailOptions {
    to: string | string[];
    subject?: string;
    html?: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        path: string;
        contentType?: string;
    }>;
    cc?: string | string[];
    bcc?: string | string[];
}

export interface InvoiceEmailOptions extends EmailOptions {
    invoiceId: string;
    invoiceNumber: string;
    clientEmail: string;
    pdfPath: string;
    pdfFilename?: string | undefined; 
}
