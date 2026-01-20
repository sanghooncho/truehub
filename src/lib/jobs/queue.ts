import { JobType, JobPriority, JobStatus, Prisma } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";

export interface EnqueueJobOptions {
  type: JobType;
  payload: Prisma.InputJsonValue;
  priority?: JobPriority;
  scheduledAt?: Date;
  maxAttempts?: number;
}

export async function enqueueJob(options: EnqueueJobOptions): Promise<string> {
  const job = await prisma.job.create({
    data: {
      type: options.type,
      payload: options.payload,
      priority: options.priority || JobPriority.MEDIUM,
      scheduledAt: options.scheduledAt || new Date(),
      maxAttempts: options.maxAttempts || 3,
      status: JobStatus.PENDING,
    },
  });

  return job.id;
}

export async function enqueueJobBatch(jobs: EnqueueJobOptions[]): Promise<string[]> {
  const created = await prisma.job.createManyAndReturn({
    data: jobs.map((j) => ({
      type: j.type,
      payload: j.payload,
      priority: j.priority || JobPriority.MEDIUM,
      scheduledAt: j.scheduledAt || new Date(),
      maxAttempts: j.maxAttempts || 3,
      status: JobStatus.PENDING,
    })),
  });

  return created.map((j) => j.id);
}

export async function getPendingJobs(limit: number = 50) {
  return prisma.job.findMany({
    where: {
      status: JobStatus.PENDING,
      scheduledAt: { lte: new Date() },
    },
    orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }],
    take: limit,
  });
}

export async function markJobProcessing(jobId: string) {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.PROCESSING,
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });
}

export async function markJobCompleted(jobId: string, result?: unknown) {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.COMPLETED,
      completedAt: new Date(),
      result: result ? (result as object) : undefined,
    },
  });
}

export async function markJobFailed(jobId: string, error: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return;

  const isDeadJob = job.attempts >= job.maxAttempts;

  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: isDeadJob ? JobStatus.DEAD : JobStatus.FAILED,
      failedAt: new Date(),
      errorMessage: error,
    },
  });
}

export async function retryFailedJob(jobId: string) {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.PENDING,
      scheduledAt: new Date(Date.now() + 60000),
      errorMessage: null,
      failedAt: null,
    },
  });
}

export async function getJobStats() {
  const [pending, processing, completed, failed, dead] = await Promise.all([
    prisma.job.count({ where: { status: JobStatus.PENDING } }),
    prisma.job.count({ where: { status: JobStatus.PROCESSING } }),
    prisma.job.count({ where: { status: JobStatus.COMPLETED } }),
    prisma.job.count({ where: { status: JobStatus.FAILED } }),
    prisma.job.count({ where: { status: JobStatus.DEAD } }),
  ]);

  return { pending, processing, completed, failed, dead };
}
