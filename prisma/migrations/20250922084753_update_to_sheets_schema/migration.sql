/*
  Warnings:

  - You are about to drop the column `anxiety` on the `ClientData` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `ClientData` table. All the data in the column will be lost.
  - You are about to drop the column `mood` on the `ClientData` table. All the data in the column will be lost.
  - You are about to drop the column `motivation` on the `ClientData` table. All the data in the column will be lost.
  - You are about to drop the column `sleepQuality` on the `ClientData` table. All the data in the column will be lost.
  - You are about to drop the column `socialSupport` on the `ClientData` table. All the data in the column will be lost.
  - You are about to drop the column `stress` on the `ClientData` table. All the data in the column will be lost.
  - You are about to drop the column `timepoint` on the `ClientData` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `ClientData` table. All the data in the column will be lost.
  - You are about to drop the column `wellbeing` on the `ClientData` table. All the data in the column will be lost.
  - Added the required column `chatLink` to the `ClientData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coachName` to the `ClientData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationDate` to the `ClientData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ClientData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weeks` to the `ClientData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClientData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "coachName" TEXT NOT NULL,
    "wellbeingT0" INTEGER,
    "wellbeingT4" INTEGER,
    "status" TEXT NOT NULL,
    "registrationDate" DATETIME NOT NULL,
    "weeks" REAL NOT NULL,
    "chatLink" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ClientData" ("clientId", "clientName", "createdAt", "id", "updatedAt") SELECT "clientId", "clientName", "createdAt", "id", "updatedAt" FROM "ClientData";
DROP TABLE "ClientData";
ALTER TABLE "new_ClientData" RENAME TO "ClientData";
CREATE INDEX "ClientData_clientId_idx" ON "ClientData"("clientId");
CREATE INDEX "ClientData_coachName_idx" ON "ClientData"("coachName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
