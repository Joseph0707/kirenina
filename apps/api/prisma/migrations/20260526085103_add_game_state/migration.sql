-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "state" JSONB;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "allowSpectators" BOOLEAN NOT NULL DEFAULT false;
