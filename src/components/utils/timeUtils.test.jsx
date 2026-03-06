import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getShortTimeAgo } from './timeUtils';

describe('getShortTimeAgo', () => {
  const MOCK_DATE = new Date('2023-10-15T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string for falsy input', () => {
    expect(getShortTimeAgo(null)).toBe('');
    expect(getShortTimeAgo(undefined)).toBe('');
    expect(getShortTimeAgo('')).toBe('');
  });

  it('returns "just now" for dates less than 60 seconds ago', () => {
    const inputDate = new Date(MOCK_DATE.getTime() - 59 * 1000); // 59 seconds ago
    expect(getShortTimeAgo(inputDate)).toBe('just now');

    const inputDate2 = new Date(MOCK_DATE.getTime()); // 0 seconds ago
    expect(getShortTimeAgo(inputDate2)).toBe('just now');
  });

  it('returns "X mins ago" for dates less than 60 minutes ago', () => {
    const inputDate = new Date(MOCK_DATE.getTime() - 60 * 1000); // 1 minute ago
    expect(getShortTimeAgo(inputDate)).toBe('1 mins ago');

    const inputDate2 = new Date(MOCK_DATE.getTime() - 59 * 60 * 1000); // 59 minutes ago
    expect(getShortTimeAgo(inputDate2)).toBe('59 mins ago');
  });

  it('returns "Xhrs ago" for dates less than 24 hours ago', () => {
    const inputDate = new Date(MOCK_DATE.getTime() - 60 * 60 * 1000); // 1 hour ago
    expect(getShortTimeAgo(inputDate)).toBe('1hrs ago');

    const inputDate2 = new Date(MOCK_DATE.getTime() - 23 * 60 * 60 * 1000); // 23 hours ago
    expect(getShortTimeAgo(inputDate2)).toBe('23hrs ago');
  });

  it('returns "yesterday" for dates exactly 1 day ago', () => {
    const inputDate = new Date(MOCK_DATE.getTime() - 24 * 60 * 60 * 1000); // 24 hours (1 day) ago
    expect(getShortTimeAgo(inputDate)).toBe('yesterday');

    const inputDate2 = new Date(MOCK_DATE.getTime() - 47 * 60 * 60 * 1000); // 47 hours ago (still 1 day ago logically via floor)
    expect(getShortTimeAgo(inputDate2)).toBe('yesterday');
  });

  it('returns "X days ago" for dates between 2 and 29 days ago', () => {
    const inputDate = new Date(MOCK_DATE.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    expect(getShortTimeAgo(inputDate)).toBe('2 days ago');

    const inputDate2 = new Date(MOCK_DATE.getTime() - 29 * 24 * 60 * 60 * 1000); // 29 days ago
    expect(getShortTimeAgo(inputDate2)).toBe('29 days ago');
  });

  it('returns "X month(s) ago" for dates between 30 and 364 days ago', () => {
    // 30 days ago => 1 month
    const inputDate = new Date(MOCK_DATE.getTime() - 30 * 24 * 60 * 60 * 1000);
    expect(getShortTimeAgo(inputDate)).toBe('1 month ago');

    // 60 days ago => 2 months
    const inputDate2 = new Date(MOCK_DATE.getTime() - 60 * 24 * 60 * 60 * 1000);
    expect(getShortTimeAgo(inputDate2)).toBe('2 months ago');

    // 359 days ago => 11 months
    const inputDate3 = new Date(MOCK_DATE.getTime() - 359 * 24 * 60 * 60 * 1000);
    expect(getShortTimeAgo(inputDate3)).toBe('11 months ago');
  });

  it('returns "X year(s) ago" for dates 365 days ago or more', () => {
    // 365 days ago => 1 year
    const inputDate = new Date(MOCK_DATE.getTime() - 365 * 24 * 60 * 60 * 1000);
    expect(getShortTimeAgo(inputDate)).toBe('1 year ago');

    // 730 days ago => 2 years
    const inputDate2 = new Date(MOCK_DATE.getTime() - 730 * 24 * 60 * 60 * 1000);
    expect(getShortTimeAgo(inputDate2)).toBe('2 years ago');
  });
});
