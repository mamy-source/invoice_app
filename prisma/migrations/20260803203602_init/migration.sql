-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `invoice_number` VARCHAR(191) NOT NULL,
    `client_email` VARCHAR(191) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `pdf_path` VARCHAR(191) NULL,
    `email_sent` BOOLEAN NOT NULL DEFAULT false,
    `email_error` VARCHAR(191) NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `invoice_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
