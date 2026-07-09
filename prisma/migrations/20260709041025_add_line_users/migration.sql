-- CreateTable
CREATE TABLE "line_users" (
    "id" TEXT NOT NULL,
    "lineUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "pictureUrl" TEXT,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "daysBeforeExpiration" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "line_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "line_users_lineUserId_key" ON "line_users"("lineUserId");

-- CreateIndex
CREATE INDEX "line_users_lineUserId_idx" ON "line_users"("lineUserId");

-- CreateIndex
CREATE INDEX "line_users_notificationsEnabled_idx" ON "line_users"("notificationsEnabled");
