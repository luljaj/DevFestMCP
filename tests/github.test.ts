import { afterEach, describe, expect, test, vi } from 'vitest';
import { getGitHubQuotaResetMs, isGitHubQuotaError } from '@/lib/github';

describe('GitHub quota helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('detects primary rate limit exhaustion via header', () => {
    const error = {
      status: 403,
      message: 'API rate limit exceeded for user.',
      response: {
        headers: {
          'x-ratelimit-remaining': '0',
        },
      },
    };

    expect(isGitHubQuotaError(error)).toBe(true);
  });

  test('detects secondary rate limit message', () => {
    const error = {
      status: 429,
      message: 'You have exceeded a secondary rate limit and have been temporarily blocked.',
      response: {
        headers: {},
      },
    };

    expect(isGitHubQuotaError(error)).toBe(true);
  });

  test('returns false for non-quota errors', () => {
    const error = {
      status: 404,
      message: 'Not Found',
      response: {
        headers: {},
      },
    };

    expect(isGitHubQuotaError(error)).toBe(false);
  });

  test('parses retry-after seconds', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    const error = {
      response: {
        headers: {
          'retry-after': '120',
        },
      },
    };

    expect(getGitHubQuotaResetMs(error)).toBe(1_700_000_120_000);
  });

  test('parses x-ratelimit-reset epoch seconds', () => {
    const error = {
      response: {
        headers: {
          'x-ratelimit-reset': '1700000120',
        },
      },
    };

    expect(getGitHubQuotaResetMs(error)).toBe(1_700_000_120_000);
  });
});
