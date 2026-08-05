import type { Product } from "../models/invoice.models.js";

export const calculateTotal = (
  products: Product[]
): number => {
  return products.reduce(
    (total, product) =>
      total + product.quantity * product.unitPrice,
    0
  );
};