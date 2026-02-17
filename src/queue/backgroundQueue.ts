const queue: Array<() => Promise<void>> = [];
let processing = false;

async function drainQueue(): Promise<void> {
  if (processing) {
    return;
  }

  processing = true;

  while (queue.length > 0) {
    const task = queue.shift();
    if (!task) {
      continue;
    }

    try {
      await task();
    } catch {
      // Errors are expected to be handled/logged by each task.
    }
  }

  processing = false;
}

export function enqueueTask(task: () => Promise<void>): void {
  queue.push(task);
  setImmediate(() => {
    void drainQueue();
  });
}
