-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `image` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `dateFrom` VARCHAR(191) NOT NULL,
    `dateTo` VARCHAR(191) NOT NULL,
    `shop` ENUM('Konzum', 'Spar', 'Lidl', 'Plodine', 'Kaufland') NOT NULL,
    `product` TEXT NOT NULL,
    `valid` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` INTEGER NOT NULL,
    `shop` ENUM('Konzum', 'Spar', 'Lidl', 'Plodine', 'Kaufland') NULL,
    `level` ENUM('Info', 'Error', 'Success') NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `trace` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stats` (
    `shop` ENUM('Konzum', 'Spar', 'Lidl', 'Plodine', 'Kaufland') NOT NULL,
    `state` ENUM('Running', 'Success', 'Error') NOT NULL,
    `start` DATETIME(3) NOT NULL,
    `productTotal` INTEGER NULL,
    `productValid` INTEGER NULL,
    `duration` INTEGER NULL,

    UNIQUE INDEX `Stats_shop_key`(`shop`),
    PRIMARY KEY (`shop`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
