-- AlterTable
ALTER TABLE "Monitor" ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "lastErrorMessage" TEXT,
ADD COLUMN     "lastResponseTimeMs" INTEGER,
ADD COLUMN     "lastStatus" TEXT,
ADD COLUMN     "lastStatusCode" INTEGER;
