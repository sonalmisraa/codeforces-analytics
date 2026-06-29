-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('CODEFORCES', 'LEETCODE', 'CODECHEF', 'ATCODER');

-- CreateEnum
CREATE TYPE "ProblemTopic" AS ENUM ('GREEDY', 'DP', 'GRAPHS', 'TREES', 'BINARY_SEARCH', 'MATH', 'IMPLEMENTATION', 'STRINGS', 'DATA_STRUCTURES', 'NUMBER_THEORY', 'GEOMETRY', 'SORTING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "college" TEXT,
    "branch" TEXT,
    "country" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "resumeUrl" TEXT,
    "bio" TEXT,
    "favoriteLanguages" TEXT[],
    "codeforcesHandle" TEXT,
    "leetcodeUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeforcesRating" INTEGER,
    "codeforcesMaxRating" INTEGER,
    "codeforcesRank" TEXT,
    "codeforcesMaxRank" TEXT,
    "codeforcesContests" INTEGER,
    "codeforcesSolved" INTEGER,
    "leetcodeTotalSolved" INTEGER,
    "leetcodeEasySolved" INTEGER,
    "leetcodeMediumSolved" INTEGER,
    "leetcodeHardSolved" INTEGER,
    "leetcodeAcceptRate" DOUBLE PRECISION,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalSolved" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contestId" INTEGER NOT NULL,
    "contestName" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'CODEFORCES',
    "rank" INTEGER,
    "oldRating" INTEGER,
    "newRating" INTEGER,
    "ratingChange" INTEGER,
    "problemsSolved" INTEGER,
    "contestDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "problemsSolved" INTEGER NOT NULL DEFAULT 0,
    "minutesCoded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" "ProblemTopic" NOT NULL,
    "solved" INTEGER NOT NULL DEFAULT 0,
    "attempted" INTEGER NOT NULL DEFAULT 0,
    "platform" "Platform" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "problemsSolved" INTEGER NOT NULL DEFAULT 0,
    "hoursCoded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contestsGiven" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_codeforcesHandle_key" ON "users"("codeforcesHandle");

-- CreateIndex
CREATE UNIQUE INDEX "users_leetcodeUsername_key" ON "users"("leetcodeUsername");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "contest_history_userId_contestId_platform_key" ON "contest_history"("userId", "contestId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activity_userId_date_key" ON "daily_activity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "problem_stats_userId_topic_platform_key" ON "problem_stats"("userId", "topic", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_progress_userId_weekStart_key" ON "weekly_progress"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_history" ADD CONSTRAINT "contest_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_activity" ADD CONSTRAINT "daily_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_stats" ADD CONSTRAINT "problem_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_progress" ADD CONSTRAINT "weekly_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
