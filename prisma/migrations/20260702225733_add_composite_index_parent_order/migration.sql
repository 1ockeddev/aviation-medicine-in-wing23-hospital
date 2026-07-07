-- DropIndex
DROP INDEX "categories_order_idx";

-- CreateIndex
CREATE INDEX "categories_parentId_order_idx" ON "categories"("parentId", "order");
