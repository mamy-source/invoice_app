import type { CreateInvoice, InvoiceWithProducts } from "../models/invoice.models.js";

export interface IInvoiceRepository {
    create(
      data: CreateInvoice,
      total: number,
      invoiceNumber: string
    ): Promise<InvoiceWithProducts>;
  
    findAll(): Promise<InvoiceWithProducts[]>;
  
    findById(
      id: string
    ): Promise<InvoiceWithProducts | null>;
  
    update(
      id: string,
      data: Partial<CreateInvoice>,
      total?: number,
      invoiceNumber?: string
    ): Promise<InvoiceWithProducts>;
  
    delete(id: string): Promise<void>;
  }