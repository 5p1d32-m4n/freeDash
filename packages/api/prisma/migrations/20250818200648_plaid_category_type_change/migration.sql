-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "plaidCategory" DROP NOT NULL,
ALTER COLUMN "plaidCategory" SET DATA TYPE TEXT;
