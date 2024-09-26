/*
  Warnings:

  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Contact` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `linkedContactId` column on the `Contact` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_linkedContactId_fkey";

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "linkedContactId",
ADD COLUMN     "linkedContactId" INTEGER,
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_linkedContactId_fkey" FOREIGN KEY ("linkedContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
