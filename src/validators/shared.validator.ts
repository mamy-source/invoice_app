import { z } from 'zod';

// Formats PDF valides
export const PDF_FORMATS = ['A4', 'A5', 'POS', 'THERMAL'] as const;
export type PdfFormat = typeof PDF_FORMATS[number];

// Schema pour le format PDF
export const pdfFormatSchema = z
    .enum(PDF_FORMATS)
    .default('A4')
    .optional();

// Schema pour l'ID
export const idSchema = z
    .string()
    .min(1, "L'ID est requis")
    .trim();

// Schema pour le nom de fichier
export const filenameSchema = z
    .string()
    .min(1, "Le nom du fichier est requis")
    .optional();


// Schema pour les IDs multiples
export const multipleIdsSchema = z
    .array(z.string().min(1, "Chaque ID doit être une chaîne non vide"))
    .min(1, "Au moins un ID est requis");