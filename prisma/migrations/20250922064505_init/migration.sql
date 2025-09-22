-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COACH',
    "coachId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClientData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "timepoint" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "wellbeing" INTEGER NOT NULL,
    "stress" INTEGER NOT NULL,
    "mood" INTEGER NOT NULL,
    "anxiety" INTEGER NOT NULL,
    "sleepQuality" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "socialSupport" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientData_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ClientData_coachId_idx" ON "ClientData"("coachId");

-- CreateIndex
CREATE INDEX "ClientData_clientId_idx" ON "ClientData"("clientId");
