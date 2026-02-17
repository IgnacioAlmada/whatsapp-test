import type { AxiosError } from "axios";

function isRetryable(error: unknown): boolean {
  const status = (error as AxiosError)?.response?.status;
  if (!status) {
    return true;
  }

  return status >= 500 || status === 429;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: { attempts: number; initialDelayMs: number; onRetry?: (ctx: { attempt: number; delay: number; error: unknown }) => void }
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === options.attempts || !isRetryable(error)) {
        throw error;
      }

      const delay = options.initialDelayMs * attempt;
      options.onRetry?.({ attempt, delay, error });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
