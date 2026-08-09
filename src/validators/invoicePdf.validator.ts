import { z } from 'zod';
import { pdfFormatSchema, idSchema, filenameSchema} from './shared.validator.js';

/**
 * Validation pour l'export d'une seule facture
 * POST /api/invoices/:id/export
 */
export const exportPdfSchema = z.object({
    params: z.object({
        id: idSchema
    }),
    query: z.object({
        format: pdfFormatSchema
    })
});

/**
 * Validation pour le téléchargement d'une facture
 * GET /api/invoices/:id/download
 */
export const downloadPdfSchema = z.object({
    params: z.object({
        id: idSchema
    }),
    query: z.object({
        format: pdfFormatSchema,
        filename: filenameSchema
    })
});


/**
 * Validation pour l'export multiple
 * POST /api/invoices/export/bulk
 * POST /api/invoices/export
 */
export const exportPdfsSchema = z.object({
    query: z.object({
        format: pdfFormatSchema,
        ids: z.string().optional()
    }),
    body: z.object({
        invoiceIds: z.array(z.string().min(1, "Chaque ID doit être une chaîne non vide"))
            .min(1, "Au moins un ID est requis")
            .optional()
    }).optional()
}).refine(
    (data) => {
        // Soit ids dans query, soit invoiceIds dans body
        const hasIds = data.query.ids && data.query.ids.length > 0;
        const hasInvoiceIds = data.body?.invoiceIds && data.body.invoiceIds.length > 0;
        return hasIds || hasInvoiceIds;
    },
    {
        message: "Veuillez fournir des IDs via 'ids' (query) ou 'invoiceIds' (body)",
        path: ["query", "ids"]
    }
);

/**
 * Validation pour la suppression d'une seule facture
 * DELETE /api/invoices/:id/pdf
 */
export const deletePdfSchema = z.object({
    params: z.object({
        id: idSchema
    })
});

/**
 * Validation pour l'envoi d'email
 */
export const sendEmailSchema = z.object({
    params: z.object({
        id: idSchema
    }),
    query: z.object({
        format: pdfFormatSchema,
        subject: z.string().optional(),
        to: z.string().email("Email invalide").optional()
    })
});

/**
 * Validation pour l'envoi multiple d'emails
 */
export const sendMultipleEmailSchema = z.object({
    body: z.object({
        invoiceIds: z.array(z.string().min(1, "Chaque ID doit être une chaîne non vide"))
            .min(1, "Au moins un ID est requis")
            .optional(),
        format: pdfFormatSchema,
        subject: z.string().optional()
    })
});



// ============================================
// TYPES INFERES
// ============================================

export type ExportPdfValidation = z.infer<typeof exportPdfSchema>;
export type DownloadPdfValidation = z.infer<typeof downloadPdfSchema>;
export type ExportPdfsValidation = z.infer<typeof exportPdfsSchema>;
export type DeletePdfValidation = z.infer<typeof deletePdfSchema>;
