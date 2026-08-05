import InvoiceRepository from "../repositories/invoice.repository.js";
import type { CreateInvoice } from "../models/invoice.models.js";
import logger from "../libs/logger.lib.js";
import { AppError } from "../middlewares/error.middleware.js";
import { calculateTotal } from "../utils/calculate-total.js";
import { generateInvoiceNumber } from "../utils/generate-invoice-number.js";


export default class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository
  ) {}

  public async create(data: CreateInvoice) {
    logger.info("Creating new invoice", {
      clientEmail: data.clientEmail,
    });

    // Validation métier
    if (data.products.length === 0) {
      logger.warn("Invoice creation failed: no products");

      throw new AppError(
        "Invoice must contain at least one product",
        400
      );
    }

    for (const product of data.products) {
      if (product.quantity <= 0) {
        throw new AppError(
          `Invalid quantity for product '${product.name}'`,
          400
        );
      }

      if (product.unitPrice <= 0) {
        throw new AppError(
          `Invalid price for product '${product.name}'`,
          400
        );
      }
    }

    // Business rule
    const total = calculateTotal(data.products);

    // Business rule
    const invoiceNumber = generateInvoiceNumber();

    const invoice = await this.invoiceRepository.create(
      data,
      total,
      invoiceNumber
    );

    logger.info("Invoice created successfully", {
      invoiceId: invoice.id,
      invoiceNumber,
    });

    return invoice;
  }

  public async findAll() {
    logger.info("Fetching all invoices");

    return this.invoiceRepository.findAll();
  }

  public async findById(id: string) {
    logger.info("Fetching invoice", { id });

    const invoice =
      await this.invoiceRepository.findById(id);

    if (!invoice) {
      logger.warn("Invoice not found", { id });

      throw new AppError(
        "Invoice not found",
        404
      );
    }

    return invoice;
  }

  public async update(
    id: string,
    data: CreateInvoice
  ) {
    await this.findById(id);

    const total = calculateTotal(data.products);

    return this.invoiceRepository.update(
      id,
      data,
      total
    );
  }

  public async delete(id: string) {
    await this.findById(id);

    await this.invoiceRepository.delete(id);

    logger.info("Invoice deleted", { id });
  }

}