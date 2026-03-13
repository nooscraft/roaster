-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "bubbleScore" DOUBLE PRECISION NOT NULL,
    "roastText" TEXT NOT NULL,
    "bioText" TEXT,
    "tweetSamples" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Badge_handle_idx" ON "Badge"("handle");

-- CreateIndex
CREATE INDEX "Badge_createdAt_idx" ON "Badge"("createdAt");
