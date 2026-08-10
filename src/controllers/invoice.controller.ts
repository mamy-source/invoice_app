import type { Request, RequestHandler, Response } from "express";
import InvoiceService from "../services/invoice.service.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/response.js";

type IdParams = {id: string};
export default class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

    
    //create invoice
    public create:RequestHandler = asyncHandler(async(req: Request, res: Response) => {
        const invoice = await this.invoiceService.create(req.body);
        return sendCreated(res, invoice, "Invoice created successfully");
    });

    //get all invoices
    public findAll:RequestHandler = asyncHandler(async(_req: Request, res: Response) => {
        const invoices = await this.invoiceService.findAll();
        return sendSuccess(res, invoices, "Invoices retrieved successfully");
    });

    //get invoice by id
    public findById:RequestHandler<IdParams> = asyncHandler<IdParams>(async(req: Request<IdParams>, res: Response) => {
        const invoice = await this.invoiceService.findById(req.params.id);
        return sendSuccess(res, invoice, "Invoice retrieved successfully");
    });

    //update invoice
    public update:RequestHandler<IdParams> = asyncHandler<IdParams>(async(req: Request<IdParams>, res: Response) => {
        const invoice = await this.invoiceService.update(req.params.id, req.body);
        return sendSuccess(res, invoice, "Invoice updated successfully");
    });

    //delete invoice
    public delete:RequestHandler<IdParams> = asyncHandler<IdParams>(async(req: Request<IdParams>, res: Response) => {
        await this.invoiceService.delete(req.params.id);
        return sendNoContent(res, "Invoice deleted successfully");
    });

}