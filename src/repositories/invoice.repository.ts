import type {
    Prisma,
    PrismaClient,
  } from "../../generated/prisma/client.js";
  
  import type {
    CreateInvoice,
    InvoiceWithProducts,
  } from "../models/invoice.models.js";
  import type { IInvoiceRepository } from "../interfaces/invoice.repository.interface.js";
  
  type PrismaExecutor =
    | PrismaClient
    | Prisma.TransactionClient;
  
  export default class InvoiceRepository
    implements IInvoiceRepository
  {
    constructor(
      private readonly prisma: PrismaExecutor
    ) {}
  
    async create(
      data: CreateInvoice,
      total: number,
      invoiceNumber: string
    ): Promise<InvoiceWithProducts> {
      return this.prisma.invoice.create({
        data: {
          clientEmail: data.clientEmail,
          invoiceNumber,
          total,
  
          products: {
            create: data.products.map((product) => ({
              name: product.name,
              quantity: product.quantity,
              unitPrice: product.unitPrice,
            })),
          },
        },
  
        include: {
          products: true,
        },
      });
    }
  
    async findAll(): Promise<InvoiceWithProducts[]> {
      return this.prisma.invoice.findMany({
        include: {
          products: true,
        },
  
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  
    async findById(
      id: string
    ): Promise<InvoiceWithProducts | null> {
      return this.prisma.invoice.findUnique({
        where: { id },
  
        include: {
          products: true,
        },
      });
    }

    async update(
      id: string,
      data: Partial<CreateInvoice>,
      total?: number,
      invoiceNumber?: string
    ): Promise<InvoiceWithProducts> {
    
      const updateData: Prisma.InvoiceUpdateInput = {};
    
      if (data.clientEmail !== undefined) {
        updateData.clientEmail = data.clientEmail;
      }
    
      if (total !== undefined) {
        updateData.total = total;
      }
    
      if (invoiceNumber !== undefined) {
        updateData.invoiceNumber = invoiceNumber;
      }
    
      if (data.products !== undefined) {
        updateData.products = {
          deleteMany: {},
          create: data.products.map((product) => ({
            name: product.name,
            quantity: product.quantity,
            unitPrice: product.unitPrice,
          })),
        };
      }
    
      return this.prisma.invoice.update({
        where: { id },
        data: updateData,
        include: {
          products: true,
        },
      });
    }
  
    async delete(id: string): Promise<void> {
      await this.prisma.invoice.delete({
        where: { id },
      });
    }
  }