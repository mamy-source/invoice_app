import { Router } from "express";
import InvoiceController from "../controllers/invoice.controller.js";
import InvoiceService from "../services/invoice.service.js";
import InvoiceRepository from "../repositories/invoice.repository.js";

import InvoicePdfController from "../controllers/invoice.pdf.controller.js";
import InvoicePdfService from "../services/invoice.pdf.service.js";

import { exportPdfSchema,
    downloadPdfSchema,
    exportPdfsSchema,
    deletePdfSchema,
 } from "../validators/invoicePdf.validator.js";

import prisma from "../config/prisma.js";
import { validate, validateWithOptions } from "../middlewares/validation.middleware.js";

import { createInvoiceSchema, updateInvoiceSchema } from "../validators/invoice.validator.js";

const router:Router = Router();


const repository = new InvoiceRepository(prisma);
const service = new InvoiceService(repository);
const controller = new InvoiceController(service);


const invoicePdfService = new InvoicePdfService(repository);
const invoicePdfController = new InvoicePdfController(invoicePdfService);

router.post("/", validate(createInvoiceSchema), controller.create.bind(controller));
router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findById.bind(controller));
router.patch("/:id", validate(updateInvoiceSchema), controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

router.post('/:id/export', validateWithOptions(exportPdfSchema), invoicePdfController.exportPdf);
router.get('/:id/download', validateWithOptions(downloadPdfSchema), invoicePdfController.downloadPdf);
router.delete('/:id/pdf', validate(deletePdfSchema), invoicePdfController.deletePdf);

router.post('/export/bulk', validate(exportPdfsSchema), invoicePdfController.exportPdfs);

export default router;