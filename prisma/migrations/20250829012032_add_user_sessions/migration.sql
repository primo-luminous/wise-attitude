-- CreateTable
CREATE TABLE "user_session" (
    "id" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ipAddress" TEXT,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_session_sessionToken_key" ON "user_session"("sessionToken");

-- CreateIndex
CREATE INDEX "user_session_employeeId_idx" ON "user_session"("employeeId");

-- CreateIndex
CREATE INDEX "user_session_sessionToken_idx" ON "user_session"("sessionToken");

-- CreateIndex
CREATE INDEX "user_session_deviceId_idx" ON "user_session"("deviceId");

-- CreateIndex
CREATE INDEX "user_session_expiresAt_idx" ON "user_session"("expiresAt");

-- CreateIndex
CREATE INDEX "user_session_isActive_idx" ON "user_session"("isActive");

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("em_id") ON DELETE CASCADE ON UPDATE CASCADE;
