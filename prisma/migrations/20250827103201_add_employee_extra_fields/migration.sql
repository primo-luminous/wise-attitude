-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOST', 'BROKEN');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('OPEN', 'CLOSED', 'OVERDUE', 'CANCELLED');

-- CreateTable
CREATE TABLE "department" (
    "d_id" SERIAL NOT NULL,
    "d_name_en" TEXT NOT NULL,
    "d_name_th" TEXT NOT NULL,
    "d_description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("d_id")
);

-- CreateTable
CREATE TABLE "position" (
    "p_id" SERIAL NOT NULL,
    "p_name_en" TEXT NOT NULL,
    "p_name_th" TEXT NOT NULL,
    "p_description" TEXT,
    "p_level" INTEGER NOT NULL DEFAULT 1,
    "p_department" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "position_pkey" PRIMARY KEY ("p_id")
);

-- CreateTable
CREATE TABLE "employee" (
    "em_id" SERIAL NOT NULL,
    "em_employeeID" TEXT NOT NULL,
    "em_titlePrefix" TEXT,
    "em_name" TEXT NOT NULL,
    "em_nickname" TEXT,
    "em_citizenID" TEXT,
    "em_email" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "em_password" TEXT NOT NULL,
    "em_Image" TEXT,
    "em_pp_phone" TEXT,
    "em_w_phone" TEXT,
    "em_birthday" TIMESTAMP(3),
    "em_status" "EmployeeStatus" NOT NULL DEFAULT 'active',
    "em_department" INTEGER,
    "em_position" INTEGER,
    "em_address" TEXT,
    "em_day_off" TEXT,
    "em_education_level" TEXT,
    "em_university" TEXT,
    "em_major" TEXT,
    "em_bank_name" TEXT,
    "em_bank_account_number" TEXT,
    "em_ss_start" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("em_id")
);

-- CreateTable
CREATE TABLE "asset_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "description" TEXT,
    "imageUrl" TEXT,
    "isSerialized" BOOLEAN NOT NULL DEFAULT false,
    "totalQty" INTEGER NOT NULL DEFAULT 0,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchasePrice" DECIMAL(12,2),
    "purchaseDate" TIMESTAMP(3),
    "warrantyMonths" INTEGER,
    "warrantyUntil" TIMESTAMP(3),
    "supplierId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_unit" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "note" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan" (
    "id" SERIAL NOT NULL,
    "borrowerId" INTEGER NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'OPEN',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_item" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "quantityReturned" INTEGER NOT NULL DEFAULT 0,
    "assetUnitId" INTEGER,
    "startAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_d_name_en_key" ON "department"("d_name_en");

-- CreateIndex
CREATE UNIQUE INDEX "department_d_name_th_key" ON "department"("d_name_th");

-- CreateIndex
CREATE UNIQUE INDEX "position_p_name_en_key" ON "position"("p_name_en");

-- CreateIndex
CREATE UNIQUE INDEX "position_p_name_th_key" ON "position"("p_name_th");

-- CreateIndex
CREATE INDEX "position_p_department_idx" ON "position"("p_department");

-- CreateIndex
CREATE UNIQUE INDEX "employee_em_employeeID_key" ON "employee"("em_employeeID");

-- CreateIndex
CREATE UNIQUE INDEX "employee_em_citizenID_key" ON "employee"("em_citizenID");

-- CreateIndex
CREATE UNIQUE INDEX "employee_em_email_key" ON "employee"("em_email");

-- CreateIndex
CREATE INDEX "employee_em_email_idx" ON "employee"("em_email");

-- CreateIndex
CREATE INDEX "employee_em_employeeID_idx" ON "employee"("em_employeeID");

-- CreateIndex
CREATE INDEX "employee_em_department_idx" ON "employee"("em_department");

-- CreateIndex
CREATE INDEX "employee_em_position_idx" ON "employee"("em_position");

-- CreateIndex
CREATE UNIQUE INDEX "asset_category_name_key" ON "asset_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_name_key" ON "supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "asset_sku_key" ON "asset"("sku");

-- CreateIndex
CREATE INDEX "asset_name_idx" ON "asset"("name");

-- CreateIndex
CREATE INDEX "asset_sku_idx" ON "asset"("sku");

-- CreateIndex
CREATE INDEX "asset_supplierId_idx" ON "asset"("supplierId");

-- CreateIndex
CREATE INDEX "asset_purchaseDate_idx" ON "asset"("purchaseDate");

-- CreateIndex
CREATE INDEX "asset_warrantyUntil_idx" ON "asset"("warrantyUntil");

-- CreateIndex
CREATE UNIQUE INDEX "asset_unit_serialNumber_key" ON "asset_unit"("serialNumber");

-- CreateIndex
CREATE INDEX "asset_unit_assetId_idx" ON "asset_unit"("assetId");

-- CreateIndex
CREATE INDEX "loan_borrowerId_idx" ON "loan"("borrowerId");

-- CreateIndex
CREATE INDEX "loan_status_idx" ON "loan"("status");

-- CreateIndex
CREATE INDEX "loan_dueDate_idx" ON "loan"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "loan_item_assetUnitId_key" ON "loan_item"("assetUnitId");

-- CreateIndex
CREATE INDEX "loan_item_loanId_idx" ON "loan_item"("loanId");

-- CreateIndex
CREATE INDEX "loan_item_assetId_idx" ON "loan_item"("assetId");

-- CreateIndex
CREATE INDEX "loan_item_dueAt_idx" ON "loan_item"("dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_token_key" ON "password_reset_token"("token");

-- CreateIndex
CREATE INDEX "password_reset_token_employeeId_idx" ON "password_reset_token"("employeeId");

-- CreateIndex
CREATE INDEX "password_reset_token_expiresAt_idx" ON "password_reset_token"("expiresAt");

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_p_department_fkey" FOREIGN KEY ("p_department") REFERENCES "department"("d_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_em_department_fkey" FOREIGN KEY ("em_department") REFERENCES "department"("d_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_em_position_fkey" FOREIGN KEY ("em_position") REFERENCES "position"("p_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "asset_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_unit" ADD CONSTRAINT "asset_unit_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan" ADD CONSTRAINT "loan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "employee"("em_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_item" ADD CONSTRAINT "loan_item_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_item" ADD CONSTRAINT "loan_item_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_item" ADD CONSTRAINT "loan_item_assetUnitId_fkey" FOREIGN KEY ("assetUnitId") REFERENCES "asset_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("em_id") ON DELETE CASCADE ON UPDATE CASCADE;
