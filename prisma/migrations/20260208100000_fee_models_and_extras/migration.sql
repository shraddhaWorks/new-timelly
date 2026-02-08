-- CreateTable
CREATE TABLE "FeeInstallment" (
    "id" TEXT NOT NULL,
    "studentFeeId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassFeeStructure" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "components" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassFeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraFee" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetClassId" TEXT,
    "targetSection" TEXT,
    "targetStudentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraFee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeeInstallment_studentFeeId_installmentNumber_key" ON "FeeInstallment"("studentFeeId", "installmentNumber");
CREATE INDEX "FeeInstallment_studentFeeId_idx" ON "FeeInstallment"("studentFeeId");

CREATE UNIQUE INDEX "ClassFeeStructure_classId_key" ON "ClassFeeStructure"("classId");
CREATE INDEX "ClassFeeStructure_schoolId_idx" ON "ClassFeeStructure"("schoolId");

CREATE INDEX "ExtraFee_schoolId_idx" ON "ExtraFee"("schoolId");
CREATE INDEX "ExtraFee_targetStudentId_idx" ON "ExtraFee"("targetStudentId");
CREATE INDEX "ExtraFee_targetClassId_idx" ON "ExtraFee"("targetClassId");

-- Alter Payment: make razorpay columns optional, add gateway and juspay columns
ALTER TABLE "Payment" ALTER COLUMN "razorpayOrderId" DROP NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "razorpayPaymentId" DROP NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "razorpaySignature" DROP NOT NULL;
ALTER TABLE "Payment" ADD COLUMN "gateway" TEXT NOT NULL DEFAULT 'RAZORPAY';
ALTER TABLE "Payment" ADD COLUMN "juspayOrderId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "juspayPaymentId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "juspayStatus" TEXT;
ALTER TABLE "Payment" ADD COLUMN "transactionId" TEXT;

-- AddForeignKey
ALTER TABLE "FeeInstallment" ADD CONSTRAINT "FeeInstallment_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES "StudentFee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassFeeStructure" ADD CONSTRAINT "ClassFeeStructure_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassFeeStructure" ADD CONSTRAINT "ClassFeeStructure_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExtraFee" ADD CONSTRAINT "ExtraFee_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
