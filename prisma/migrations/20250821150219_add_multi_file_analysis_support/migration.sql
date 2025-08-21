-- AlterTable
ALTER TABLE "financial_analyses" ADD COLUMN     "isMultiFileAnalysis" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "multiFileAnalysisGroupId" TEXT;
