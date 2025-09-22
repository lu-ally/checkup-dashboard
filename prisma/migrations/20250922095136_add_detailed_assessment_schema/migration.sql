-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "coachName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "registrationDate" DATETIME NOT NULL,
    "weeks" REAL NOT NULL,
    "chatLink" TEXT NOT NULL,
    "wellbeingT0Basic" INTEGER,
    "wellbeingT4Basic" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "timepoint" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL,
    "wellbeing" INTEGER,
    "stress" TEXT,
    "exhaustion" TEXT,
    "anxiety" TEXT,
    "depression" TEXT,
    "selfDoubt" TEXT,
    "sleepProblems" TEXT,
    "tension" TEXT,
    "irritability" TEXT,
    "socialWithdrawal" TEXT,
    "other" TEXT,
    "workArea" INTEGER,
    "privateArea" INTEGER,
    "adequateSleep" TEXT,
    "healthyEating" TEXT,
    "sufficientRest" TEXT,
    "exercise" TEXT,
    "setBoundaries" TEXT,
    "timeForBeauty" TEXT,
    "shareEmotions" TEXT,
    "liveValues" TEXT,
    "trust" TEXT,
    "genuineInterest" TEXT,
    "mutualUnderstanding" TEXT,
    "goalAlignment" TEXT,
    "learningExperience" INTEGER,
    "progressAchievement" INTEGER,
    "generalSatisfaction" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("clientId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientId_key" ON "Client"("clientId");

-- CreateIndex
CREATE INDEX "Client_clientId_idx" ON "Client"("clientId");

-- CreateIndex
CREATE INDEX "Client_coachName_idx" ON "Client"("coachName");

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE INDEX "Assessment_clientId_idx" ON "Assessment"("clientId");

-- CreateIndex
CREATE INDEX "Assessment_timepoint_idx" ON "Assessment"("timepoint");

-- CreateIndex
CREATE INDEX "Assessment_submittedAt_idx" ON "Assessment"("submittedAt");
