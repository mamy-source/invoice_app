import { Router } from "express";
import InvoiceController from "../controllers/invoice.controllers.js";
import InvoiceService from "../services/invoice.service.js";
import InvoiceRepository from "../repositories/invoice.repository.js";

import prisma from "../config/prisma.js";
import { validate } from "../middlewares/validation.middleware.js";

import { createInvoiceSchema, updateInvoiceSchema } from "../validators/invoice.validator.js";

const router:Router = Router();


const repository = new InvoiceRepository(prisma);
const service = new InvoiceService(repository);
const controller = new InvoiceController(service);

router.post("/", validate(createInvoiceSchema), controller.create.bind(controller));
router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findById.bind(controller));
router.patch("/:id", validate(updateInvoiceSchema), controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));


export default router;