export interface Product {
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateInvoice {
    clientEmail: string;
    products: Product[];
    pdfUrl?: string;
}

export interface UpdateInvoice {
    clientEmail?: string;
    products?: Product[];
}


export interface InvoiceResponse {
    id: string;
    invoiceNumber: string;
    clientEmail: string;
    products: ProductResponse[];
    total: number;
    createdAt: Date;
    emailSent: boolean;
    emailError?: string | null;
    
}

export interface ProductResponse {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

//Domain models
export interface InvoiceWithProducts {
    id: string;
    invoiceNumber: string;
    clientEmail: string;
    total: number;
    createdAt: Date;
    updatedAt: Date;
    pdfPath: string | null;
    emailSent: boolean;
    emailError: string | null;
    products: ProductWithInvoice[];
}

export interface ProductWithInvoice {
    id: string;
    invoiceId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
  }

