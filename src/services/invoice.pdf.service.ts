import puppeteer from "puppeteer";
import type { PaperFormat, PDFOptions } from "puppeteer";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import InvoiceRepository from "../repositories/invoice.repository.js";
import { AppError } from "../middlewares/error.middleware.js";
import logger from "../libs/logger.lib.js";
import { generateInvoiceNumber } from "../utils/generate-invoice-number.js";

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_DIR = path.join(process.cwd(), 'pdf', 'invoices');
const TEMPLATE_PATH = path.join(__dirname, '../templates/invoice-template.hbs');

// Ensure PDF directory exists
if (!existsSync(PDF_DIR)) {
  mkdirSync(PDF_DIR, { recursive: true });
}

// Handlebars Helpers Registration
const registerHandlebarsHelpers = (): void => {
  Handlebars.registerHelper("formatDate", (date: Date | string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString("fr-FR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  });

  Handlebars.registerHelper("formatCurrency", (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0 Ar';
    return new Intl.NumberFormat("fr-MG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num) + " Ar";
  });

  Handlebars.registerHelper("multiply", (a: number, b: number) => {
    return a * b;
  });

  Handlebars.registerHelper("lowercase", (str: string) => {
    return str ? str.toLowerCase() : '';
  });
};

registerHandlebarsHelpers();

// PDF Configuration Types
interface PdfConfig {
  format?: PaperFormat;
  width?: string;
  height?: string;
  printBackground: boolean;
  margin: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
}

type PdfFormat = 'POS' | 'THERMAL' | 'A4' | 'A5';

// PDF configuration based on format
const getPdfConfig = (format: PdfFormat = 'A4'): PdfConfig => {
  const configs: Record<PdfFormat, PdfConfig> = {
    POS: {
      width: '80mm',
      height: '200mm',
      printBackground: true,
      margin: { top: '5mm', bottom: '5mm', left: '5mm', right: '5mm' },
    },
    THERMAL: {
      width: '58mm',
      height: '200mm',
      printBackground: true,
      margin: { top: '3mm', bottom: '3mm', left: '3mm', right: '3mm' },
    },
    A4: {
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
    },
    A5: {
      format: 'A5',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    },
  };
  
  return configs[format] || configs.A4;
};

// Interface for invoice data
interface InvoiceData {
  id: string;
  invoiceNumber: string;
  clientEmail: string;
  total: number | string;
  createdAt: Date | string;
  status?: string;
  pdfUrl?: string;
  products: Array<{
    name: string;
    quantity: number;
    unitPrice: number | string;
  }>;
}
interface InvoiceWithProducts extends InvoiceData {
    pdfUrl?: string;
  }

// Download options
interface DownloadOptions {
    format?: PdfFormat;
    filename?: string;
    deleteAfterDownload?: boolean;
    pdfUrl?: string;
  }
  
  // Download result
  interface DownloadResult {
    filename: string;
    path: string;
    size: number;
    pdfUrl?: string;
    contentType: string;
  }

class InvoicePdfService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository
  ) {}

  /**
   * Generate or retrieve invoice number
   */
  private async getInvoiceNumber(invoice: InvoiceData): Promise<string> {
    if (invoice.invoiceNumber) {
      return invoice.invoiceNumber;
    }
    return generateInvoiceNumber();
  }

  /**
   * Generate HTML from Handlebars template
   */
  private async generateHTML(invoice: InvoiceData): Promise<string> {
    try {
      // Check if template exists
      await fs.access(TEMPLATE_PATH);
      
      const template = await fs.readFile(TEMPLATE_PATH, "utf-8");
      const compiled = Handlebars.compile(template);

      const invoiceNumber = await this.getInvoiceNumber(invoice);

      return compiled({
        invoiceNumber,
        clientEmail: invoice.clientEmail,
        products: invoice.products || [],
        createdAt: invoice.createdAt,
        total: invoice.total || 0,
        status: invoice.status || 'DRAFT'
      });
    } catch (error) {
      logger.error("Failed to generate HTML", { error, invoiceId: invoice.id });
      throw new AppError("Failed to generate invoice HTML", 500);
    }
  }

  /**
   * Generate PDF from HTML using Puppeteer
   */
  private async generatePDF(
    html: string, 
    invoiceNumber: string,
    format: PdfFormat = 'A4'
  ): Promise<string> {
    let browser = null;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ],
        timeout: 30000
      });

      const page = await browser.newPage();

      // Set viewport for better rendering
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1,
      });

      // Load HTML content
      await page.setContent(html, {
        waitUntil: 'load',
        timeout: 10000
      });

      const pdfPath = path.join(PDF_DIR, `${invoiceNumber}.pdf`);
      const pdfConfig = getPdfConfig(format);

      await page.pdf({
        path: pdfPath,
        ...pdfConfig,
        printBackground: true,
        preferCSSPageSize: true
      } as PDFOptions);

      return pdfPath;
    } catch (error) {
      logger.error("Failed to generate PDF", { error, invoiceNumber });
      throw new AppError("Failed to generate PDF document", 500);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Export invoice as PDF
   */
  async exportInvoice(
    invoiceId: string,
    format: PdfFormat = 'A4'
  ): Promise<{ pdfPath: string; filename: string }> {
    try {
      // Validate input
      if (!invoiceId) {
        throw new AppError("Invoice ID is required", 400);
      }

      // Fetch invoice data
      const invoice = await this.invoiceRepository.findById(invoiceId);
      
      if (!invoice) {
        throw new AppError("Invoice not found", 404);
      }

      // Validate invoice data
      if (!invoice.invoiceNumber) {
        throw new AppError("Invoice number is missing", 400);
      }

      // Generate HTML
      const html = await this.generateHTML(invoice);

      // Generate PDF
      const pdfPath = await this.generatePDF(
        html, 
        invoice.invoiceNumber,
        format
      );

      // Update invoice with PDF path
      await this.invoiceRepository.update(invoiceId, {
        pdfUrl: pdfPath
      });

      logger.info(`Invoice PDF generated successfully`, {
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        pdfPath
      });

      return {
        pdfPath,
        filename: `${invoice.invoiceNumber}.pdf`
      };
    } catch (error) {
      // Re-throw AppErrors, wrap others
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error("Failed to export invoice", { 
        error, 
        invoiceId 
      });
      
      throw new AppError("Failed to export invoice", 500);
    }
  }

  /**
   * Generate PDF for multiple invoices (bulk export)
   */
  async exportInvoices(
    invoiceIds: string[],
    format: PdfFormat = 'A4'
  ): Promise<Array<{ invoiceId: string; pdfPath: string; filename: string }>> {
    const results = [];
    
    for (const invoiceId of invoiceIds) {
      try {
        const result = await this.exportInvoice(invoiceId, format);
        results.push({ invoiceId, ...result });
      } catch (error) {
        logger.error(`Failed to export invoice ${invoiceId}`, { error });
        results.push({ 
          invoiceId, 
          error: error instanceof AppError ? error.message : 'Unknown error' 
        } as any);
      }
    }
    
    return results;
  }

  /**
   * Delete invoice PDF file
   */
  async deletePDF(invoiceNumber: string): Promise<boolean> {
    try {
      const pdfPath = path.join(PDF_DIR, `${invoiceNumber}.pdf`);
      await fs.unlink(pdfPath);
      logger.info(`PDF deleted successfully: ${invoiceNumber}`);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn(`PDF not found for deletion: ${invoiceNumber}`);
        return false;
      }
      logger.error(`Failed to delete PDF: ${invoiceNumber}`, { error });
      return false;
    }
  }

    /**
   * Download invoice PDF
   * Returns file stream and metadata for download
   */
    async downloadInvoice(
        invoiceId: string,
        options: DownloadOptions = {}
      ): Promise<DownloadResult> {
        try {
          const {
            format = 'A4',
            filename,
            deleteAfterDownload = false
          } = options;
    
          // Validate input
          if (!invoiceId) {
            throw new AppError("Invoice ID is required", 400);
          }
    
          // Fetch invoice data
          const invoice = await this.invoiceRepository.findById(invoiceId);
          
          if (!invoice) {
            throw new AppError("Invoice not found", 404);
          }
    
          // Check if PDF already exists
          let pdfPath = (invoice as InvoiceWithProducts).pdfUrl;

          let pdfExists = false;
    
          if (pdfPath) {
            try {
              await fs.access(pdfPath);
              pdfExists = true;
            } catch {
              // PDF doesn't exist, regenerate
              pdfPath = undefined;
            }
          }
    
          // Generate PDF if it doesn't exist
          if (!pdfExists || !pdfPath) {
            const result = await this.exportInvoice(invoiceId, format);
            pdfPath = result.pdfPath;
          }
    
          // Get file stats
          const stats = await fs.stat(pdfPath);
    
          // Determine filename
          const finalFilename = filename || `${invoice.invoiceNumber}.pdf`;
    
          // If deleteAfterDownload is true, we'll return the file and delete it
          if (deleteAfterDownload) {
            // Read file content
            const fileContent = await fs.readFile(pdfPath);
            
            // Delete the file
            await fs.unlink(pdfPath);
            
            logger.info(`PDF downloaded and deleted`, {
              invoiceId,
              invoiceNumber: invoice.invoiceNumber,
              filename: finalFilename
            });
    
            return {
              filename: finalFilename,
              path: pdfPath,
              size: fileContent.length,
              contentType: 'application/pdf'
            };
          }
    
          logger.info(`PDF downloaded successfully`, {
            invoiceId,
            invoiceNumber: invoice.invoiceNumber,
            filename: finalFilename
          });
    
          return {
            filename: finalFilename,
            path: pdfPath,
            size: stats.size,
            contentType: 'application/pdf'
          };
        } catch (error) {
          if (error instanceof AppError) {
            throw error;
          }
          
          logger.error("Failed to download invoice", { 
            error, 
            invoiceId 
          });
          
          throw new AppError("Failed to download invoice", 500);
        }
      }
    
}

export default InvoicePdfService;