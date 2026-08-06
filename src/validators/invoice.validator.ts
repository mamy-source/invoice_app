import {z} from "zod";


export const createInvoiceSchema = z.object({
    clientEmail: z.string().email({ message: "Invalid email address" }),
    products: z.array(
        z.object({
            name: z.string().min(1, { message: "Product name is required" }),
            quantity: z.number().int().positive({ message: "Quantity must be a positive integer" }),
            unitPrice: z.number().positive({ message: "Unit price must be a positive number" }),
        })
    ).min(1, { message: "At least one product is required" }),
})

export const updateInvoiceSchema = createInvoiceSchema.partial();

export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>;