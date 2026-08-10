import { describe, it, expect } from 'vitest';
import { getUtcTimestamp } from './time';

describe('time utility', () => {
  describe('getUtcTimestamp', () => {
    it('returns a string strictly ending with Z to indicate zero UTC offset', () => {
      const timestamp = getUtcTimestamp();
      expect(timestamp.endsWith('Z')).toBe(true);
    });

    it('returns a string that can be parsed into a valid Date object', () => {
      const timestamp = getUtcTimestamp();
      const parsedDate = new Date(timestamp);
      
      // Ensure the parsed date is valid (getTime() does not return NaN)
      expect(!isNaN(parsedDate.getTime())).toBe(true);
    });

    it('produces valid chronological or identical strings on sequential calls', () => {
      const t1 = getUtcTimestamp();
      const t2 = getUtcTimestamp();
      
      const time1 = new Date(t1).getTime();
      const time2 = new Date(t2).getTime();
      
      expect(time2).toBeGreaterThanOrEqual(time1);
    });
  });
});
