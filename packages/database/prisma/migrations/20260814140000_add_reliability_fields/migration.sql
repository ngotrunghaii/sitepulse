-- AlterTable Monitor: add consecutive failure/success counters
ALTER TABLE "Monitor"
  ADD COLUMN "consecutiveFailures"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "consecutiveSuccesses" INTEGER NOT NULL DEFAULT 0;

-- AlterTable CheckResult: add retry audit fields
ALTER TABLE "CheckResult"
  ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "errorReason"  TEXT;
