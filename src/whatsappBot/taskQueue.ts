type TaskType = () => void

interface TaskQueueConstructorType {
  delay?: number
}

export class TaskQueue {
  constructor(params?: TaskQueueConstructorType) {
    this.queue = [] // Queue to store tasks
    this.isProcessing = false // Flag to check if the queue is being processed

    this.delay = params?.delay ?? 1500
  }

  queue: TaskType[]
  isProcessing: boolean
  delay: number

  async enqueue(task: TaskType): Promise<void> {
    this.queue.push(task)
    if (!this.isProcessing) {
      await this.processQueue()
    }
  }

  async processQueue(): Promise<void> {
    this.isProcessing = true
    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) {
        task()
        await delay(this.delay)
      }
    }
    this.isProcessing = false
  }

  // Helper function to simulate delay
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
