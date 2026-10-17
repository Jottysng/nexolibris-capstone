CREATE TYPE "ReadingStatus" AS ENUM ('TO_READ', 'READING', 'COMPLETED');
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'RETURNED');
CREATE TYPE "ReservationStatus" AS ENUM ('WAITING', 'AVAILABLE', 'FULFILLED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "NotificationType" AS ENUM ('RESERVATION_AVAILABLE', 'LOAN_DUE_SOON', 'SYSTEM');

CREATE TABLE "User" (
  "id" UUID NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Session" (
  "id" UUID NOT NULL, "jti" TEXT NOT NULL, "userId" UUID NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3), "replacedByJti" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_jti_key" ON "Session"("jti");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

CREATE TABLE "BookSnapshot" (
  "id" UUID NOT NULL, "openLibraryKey" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
  "authors" JSONB NOT NULL, "coverId" INTEGER, "firstPublishYear" INTEGER, "subjects" JSONB NOT NULL,
  "isbn" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BookSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BookSnapshot_openLibraryKey_key" ON "BookSnapshot"("openLibraryKey");

CREATE TABLE "Inventory" (
  "id" UUID NOT NULL, "bookId" UUID NOT NULL, "totalCopies" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Inventory_bookId_key" ON "Inventory"("bookId");

CREATE TABLE "Loan" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "bookId" UUID NOT NULL,
  "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "dueAt" TIMESTAMP(3) NOT NULL,
  "returnedAt" TIMESTAMP(3), "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Loan_userId_status_idx" ON "Loan"("userId", "status");
CREATE INDEX "Loan_bookId_status_idx" ON "Loan"("bookId", "status");

CREATE TABLE "Reservation" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "bookId" UUID NOT NULL,
  "status" "ReservationStatus" NOT NULL DEFAULT 'WAITING', "availableUntil" TIMESTAMP(3),
  "notifiedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Reservation_bookId_status_createdAt_idx" ON "Reservation"("bookId", "status", "createdAt");
CREATE INDEX "Reservation_userId_status_idx" ON "Reservation"("userId", "status");

CREATE TABLE "UserBookState" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "bookId" UUID NOT NULL, "readingStatus" "ReadingStatus",
  "wishlistedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "UserBookState_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserBookState_userId_bookId_key" ON "UserBookState"("userId", "bookId");
CREATE INDEX "UserBookState_userId_readingStatus_idx" ON "UserBookState"("userId", "readingStatus");

CREATE TABLE "Notification" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "bookId" UUID, "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL, "message" TEXT NOT NULL, "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "BookSnapshot"("id") ON DELETE CASCADE;
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "BookSnapshot"("id") ON DELETE RESTRICT;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "BookSnapshot"("id") ON DELETE RESTRICT;
ALTER TABLE "UserBookState" ADD CONSTRAINT "UserBookState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "UserBookState" ADD CONSTRAINT "UserBookState_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "BookSnapshot"("id") ON DELETE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "BookSnapshot"("id") ON DELETE SET NULL;
