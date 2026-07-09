import { describe, it, expect } from 'vitest';
import { LineUserSchema } from './validations';

describe('LineUserSchema', () => {
  describe('valid data', () => {
    it('should accept valid LINE user data with picture URL', () => {
      const validData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        pictureUrl: 'https://example.com/picture.jpg',
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      };

      const result = LineUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid LINE user data with empty string picture URL', () => {
      const validData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        pictureUrl: '',
        notificationsEnabled: false,
        daysBeforeExpiration: 7,
      };

      const result = LineUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid LINE user data without picture URL', () => {
      const validData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        notificationsEnabled: true,
        daysBeforeExpiration: 90,
      };

      const result = LineUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept minimum valid daysBeforeExpiration (1)', () => {
      const validData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        pictureUrl: '',
        notificationsEnabled: true,
        daysBeforeExpiration: 1,
      };

      const result = LineUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept maximum valid daysBeforeExpiration (90)', () => {
      const validData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        pictureUrl: '',
        notificationsEnabled: true,
        daysBeforeExpiration: 90,
      };

      const result = LineUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject empty lineUserId', () => {
      const invalidData = {
        lineUserId: '',
        displayName: 'John Doe',
        pictureUrl: '',
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      };

      const result = LineUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('LINE User ID is required');
      }
    });

    it('should reject missing lineUserId', () => {
      const invalidData = {
        displayName: 'John Doe',
        pictureUrl: '',
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      };

      const result = LineUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty displayName', () => {
      const invalidData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: '',
        pictureUrl: '',
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      };

      const result = LineUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Display name is required');
      }
    });

    it('should reject invalid pictureUrl', () => {
      const invalidData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        pictureUrl: 'not-a-valid-url',
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      };

      const result = LineUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid URL');
      }
    });

    it('should reject non-boolean notificationsEnabled', () => {
      const invalidData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        pictureUrl: '',
        notificationsEnabled: 'true' as any,
        daysBeforeExpiration: 30,
      };

      const result = LineUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject daysBeforeExpiration less than 1', () => {
      const invalidData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        pictureUrl: '',
        notificationsEnabled: true,
        daysBeforeExpiration: 0,
      };

      const result = LineUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Must be at least 1 day');
      }
    });

    it('should reject daysBeforeExpiration greater than 90', () => {
      const invalidData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        pictureUrl: '',
        notificationsEnabled: true,
        daysBeforeExpiration: 91,
      };

      const result = LineUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Must be at most 90 days');
      }
    });

    it('should reject non-integer daysBeforeExpiration', () => {
      const invalidData = {
        lineUserId: 'U1234567890abcdef1234567890abcdef',
        displayName: 'John Doe',
        pictureUrl: '',
        notificationsEnabled: true,
        daysBeforeExpiration: 30.5,
      };

      const result = LineUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
