const queue = [];
let processing = false;

async function drainQueue() {
  if (processing) {
    return;
  }

  processing = true;

  while (queue.length > 0) {
    const task = queue.shift();
    try {
      await task();
    } catch {
      // Errors are expected to be handled/logged by each task.
    }
  }

  processing = false;
}

export function enqueueTask(task) {
  queue.push(task);
  setImmediate(() => {
    void drainQueue();
  });
}
