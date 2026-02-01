// Simple queue processor
// In production, replace with BullMQ or similar

interface QueueJob {
  id: string;
  userId: string;
  jobType: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

class SimpleQueue {
  private jobs: Map<string, QueueJob> = new Map();
  private processors: Map<string, (job: QueueJob) => Promise<any>> = new Map();

  async add(jobType: string, userId: string, payload: any): Promise<string> {
    const jobId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const job: QueueJob = {
      id: jobId,
      userId,
      jobType,
      payload,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.jobs.set(jobId, job);
    this.process(jobId);
    
    return jobId;
  }

  registerProcessor(jobType: string, processor: (job: QueueJob) => Promise<any>) {
    this.processors.set(jobType, processor);
  }

  private async process(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'pending') return;

    const processor = this.processors.get(job.jobType);
    if (!processor) {
      job.status = 'failed';
      job.error = `No processor registered for job type: ${job.jobType}`;
      job.updatedAt = new Date();
      return;
    }

    job.status = 'processing';
    job.updatedAt = new Date();

    try {
      const result = await processor(job);
      job.status = 'completed';
      job.result = result;
      job.updatedAt = new Date();
    } catch (error: any) {
      job.retryCount++;
      if (job.retryCount >= 3) {
        job.status = 'failed';
        job.error = error.message;
      } else {
        job.status = 'pending';
        // Retry after delay
        setTimeout(() => this.process(jobId), 5000 * job.retryCount);
      }
      job.updatedAt = new Date();
    }
  }

  getJob(jobId: string): QueueJob | undefined {
    return this.jobs.get(jobId);
  }

  getJobsByUser(userId: string): QueueJob[] {
    return Array.from(this.jobs.values()).filter(job => job.userId === userId);
  }
}

export const queue = new SimpleQueue();
