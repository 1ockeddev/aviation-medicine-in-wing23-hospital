-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "categories_order_idx" ON "categories"("order");
