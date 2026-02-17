function isRetryable(error) {
  const status = error?.response?.status;
  if (!status) {
    return true;
  }

  return status >= 500 || status === 429;
}

export async function retryWithBackoff(operation, { attempts, initialDelayMs, onRetry }) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !isRetryable(error)) {
        throw error;
      }

      const delay = initialDelayMs * attempt;
      onRetry?.({ attempt, delay, error });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
