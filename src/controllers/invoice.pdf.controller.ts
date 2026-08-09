import type { Request, Response, RequestHandler } from "express";
import InvoicePdfService from "../services/invoice.pdf.service.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/response.js";
import logger from "../libs/logger.lib.js";
import { AppError } from "../middlewares/error.middleware.js";

type IdParams = { id: string };

const VALID_PDF_FORMATS = ['A4', 'A5', 'POS', 'THERMAL'] as const;
type PdfFormat = typeof VALID_PDF_FORMATS[number];

interface ExportPdfQuery {
    format?: string;
}

interface DownloadPdfQuery extends ExportPdfQuery {
    filename?: string;
}

// Interface pour l'export multiple
interface ExportMultiplePdfQuery {
    format?: string;
    ids?: string; // Format: "id1,id2,id3" ou "id1 id2 id3"
}

interface SendEmailParams {
    id: string;
}

interface SendEmailQuery {
    format?: string;
    subject?: string;
    to?: string;
}

interface SendMultipleEmailBody {
    invoiceIds: string[];
    format?: string;
    subject?: string;
}

export default class InvoicePdfController {
    constructor(private readonly invoicePdf: InvoicePdfService) {}

    private validatePdfFormat(format?: string): PdfFormat {
        if (format && VALID_PDF_FORMATS.includes(format as PdfFormat)) {
            return format as PdfFormat;
        }
        logger.warn(`Format PDF invalide: "${format}", utilisation du format par défaut "A4"`);
        return 'A4';
    }

    public exportPdf: RequestHandler<IdParams, any, any, ExportPdfQuery> = asyncHandler(
        async (req: Request<IdParams, any, any, ExportPdfQuery>, res: Response) => {
            const { format = 'A4' } = req.query;
            const selectedFormat = this.validatePdfFormat(format);

            logger.info(`Exportation de la facture ${req.params.id} au format ${selectedFormat}`);
            
            const result = await this.invoicePdf.exportInvoice(req.params.id, selectedFormat);

            return sendCreated(res, result, "Facture exportée avec succès");
        }
    );

    public downloadPdf: RequestHandler<IdParams, any, any, DownloadPdfQuery> = asyncHandler(
        async (req: Request<IdParams, any, any, DownloadPdfQuery>, res: Response) => {
            const { format = 'A4', filename } = req.query;
            const selectedFormat = this.validatePdfFormat(format);

            logger.info(`Téléchargement de la facture ${req.params.id} (format: ${selectedFormat})`);

            // Build download options conditionally
            const downloadOptions: { format: PdfFormat; filename?: string } = {
                format: selectedFormat
            };
            
            if (filename) {
                downloadOptions.filename = filename as string;
            }

            const result = await this.invoicePdf.downloadInvoice(req.params.id, downloadOptions);

            return sendSuccess(res, result, "Facture téléchargée avec succès");
        }
    );

    public deletePdf: RequestHandler<IdParams> = asyncHandler(
        async (req: Request<IdParams>, res: Response) => {
            const invoiceId = req.params.id;
            
            logger.info(`Suppression du PDF de la facture ${invoiceId}`);
            
            await this.invoicePdf.deletePDF(invoiceId);
            
            return sendNoContent(res, "PDF supprimé avec succès");
        }
    );

     /**
     * Exporte plusieurs factures au format PDF (Bulk Export)
     * @route POST /api/invoices/export/bulk
     * @route POST /api/invoices/export?ids=id1,id2,id3
     */
     public exportPdfs: RequestHandler<any, any, any, ExportMultiplePdfQuery> = asyncHandler(
        async (req: Request<any, any, any, ExportMultiplePdfQuery>, res: Response) => {
            const { format = 'A4', ids } = req.query;
            const selectedFormat = this.validatePdfFormat(format);

            // Extraire les IDs directement ici
            let invoiceIds: string[] = [];
            
            if (ids) {
                if (typeof ids === 'string') {
                    // Supporte: "id1,id2,id3" ou "id1 id2 id3"
                    invoiceIds = ids.split(/[, ]+/).filter(id => id.trim() !== '');
                }
            }
            
            // Depuis body
            const { invoiceIds: bodyIds } = req.body;
            if (bodyIds && Array.isArray(bodyIds)) {
                invoiceIds = bodyIds.filter((id: any) => typeof id === 'string' && id.trim() !== '');
            }

            if (invoiceIds.length === 0) {
                throw new AppError("Aucun ID de facture fourni. Veuillez spécifier 'ids' dans la requête", 400);
            }

            logger.info(`Exportation de ${invoiceIds.length} factures au format ${selectedFormat}`, {
                count: invoiceIds.length,
                ids: invoiceIds
            });

            // Exporter toutes les factures
            const results = await this.invoicePdf.exportInvoices(invoiceIds, selectedFormat);

            // Compter les succès et échecs
            const successCount = results.filter(r => !('error' in r)).length;
            const errorCount = results.filter(r => 'error' in r).length;

            logger.info(`Export bulk terminé: ${successCount} succès, ${errorCount} échecs`);

            // Retourner les résultats
            return sendSuccess(res, {
                total: results.length,
                success: successCount,
                errors: errorCount,
                details: results
            }, `${successCount} factures exportées avec succès${errorCount > 0 ? `, ${errorCount} échec(s)` : ''}`);
        }
    );
    /**
     * Envoyer une facture par email
     * @route POST /api/invoices/:id/email
     */
    public sendInvoiceEmail = asyncHandler(
        async (
          req: Request<SendEmailParams, any, any, SendEmailQuery>,
          res: Response
        ) => {
          const { format = "A4", subject, to } = req.query;
      
          const selectedFormat = this.validatePdfFormat(format);
      
          logger.info(
            `Envoi de la facture ${req.params.id} par email`,
            {
              to: to || "client",
              format: selectedFormat,
            }
          );
      
          const result = await this.invoicePdf.sendInvoiceByEmail(
            req.params.id,
            {
              format: selectedFormat,
              subject: subject as string,
              to: to as string,
            }
          );
      
          if (!result.success) {
            throw new AppError(
              result.error || "Échec de l'envoi de l'email",
              500
            );
          }
      
          return sendSuccess(
            res,
            {
              invoiceId: req.params.id,
              messageId: result.messageId,
              sent: true,
            },
            "Facture envoyée par email avec succès"
          );
        }
      );

    /**
     * Envoyer plusieurs factures par email
     * @route POST /api/invoices/email/bulk
     */
    public sendMultipleInvoiceEmails: RequestHandler<any, any, SendMultipleEmailBody, any> = asyncHandler(
        async (req: Request<any, any, SendMultipleEmailBody, any>, res: Response) => {
            const { invoiceIds, format = 'A4', subject } = req.body;

            if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
                throw new AppError('Veuillez fournir une liste d\'IDs de factures', 400);
            }

            const selectedFormat = this.validatePdfFormat(format);

            logger.info(`Envoi de ${invoiceIds.length} factures par email`, {
                count: invoiceIds.length,
                format: selectedFormat
            });

            const results = await this.invoicePdf.sendMultipleInvoicesByEmail(invoiceIds, {
                format: selectedFormat,
                ...(subject && { subject })
            });
    

            const successCount = results.filter(r => r.success).length;
            const errorCount = results.filter(r => !r.success).length;

            return sendSuccess(res, {
                total: results.length,
                success: successCount,
                errors: errorCount,
                details: results
            }, `${successCount} factures envoyées avec succès${errorCount > 0 ? `, ${errorCount} échec(s)` : ''}`);
        }
    );
}