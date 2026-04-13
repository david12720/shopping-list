const AppUtils = require('./utils.js');

describe('AppUtils', () => {
  describe('formatUnit', () => {
    it('should return Hebrew units for "units"', () => {
      expect(AppUtils.formatUnit('units')).toBe("יח'");
    });

    it('should return Hebrew kg for "kg"', () => {
      expect(AppUtils.formatUnit('kg')).toBe('ק"ג');
    });

    it('should default to units for unknown input', () => {
      expect(AppUtils.formatUnit('unknown')).toBe("יח'");
    });
  });

  describe('formatAmount', () => {
    it('should format units as integers', () => {
      expect(AppUtils.formatAmount(5, 'units')).toBe("5 יח'");
    });

    it('should floor units when given decimal', () => {
      expect(AppUtils.formatAmount(5.9, 'units')).toBe("5 יח'");
    });

    it('should keep decimal precision for kg', () => {
      expect(AppUtils.formatAmount(2.5, 'kg')).toBe('2.5 ק"ג');
    });

    it('should handle whole number kg', () => {
      expect(AppUtils.formatAmount(3, 'kg')).toBe('3 ק"ג');
    });

    it('should handle zero amount', () => {
      expect(AppUtils.formatAmount(0, 'units')).toBe("0 יח'");
      expect(AppUtils.formatAmount(0, 'kg')).toBe('0 ק"ג');
    });

    it('should handle large amounts', () => {
      expect(AppUtils.formatAmount(100, 'units')).toBe("100 יח'");
      expect(AppUtils.formatAmount(50.5, 'kg')).toBe('50.5 ק"ג');
    });
  });

  describe('generateInviteCode', () => {
    it('should return a 6-character string', () => {
      expect(AppUtils.generateInviteCode()).toHaveLength(6);
    });

    it('should only contain allowed characters', () => {
      const allowed = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const code = AppUtils.generateInviteCode();
      for (const char of code) {
        expect(allowed).toContain(char);
      }
    });

    it('should be reasonably random', () => {
      const code1 = AppUtils.generateInviteCode();
      const code2 = AppUtils.generateInviteCode();
      expect(code1).not.toBe(code2);
    });
  });
});
