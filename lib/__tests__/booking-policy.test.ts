import { describe, expect, it } from 'vitest';
import { BOOKING_POLICY, checkPickupArea, priceUnitFor } from '@/lib/booking-policy';

describe('Wadi pickup policy', () => {
  it('accepts the configured Wadi PIN only with an explicit Wadi locality', () => {
    expect(checkPickupArea('440023', 'wadi')).toBe('eligible');
    expect(checkPickupArea('440023', 'outside')).toBe('outside');
    expect(checkPickupArea('440001', 'wadi')).toBe('outside');
  });
  it('rejects incomplete and malformed PIN or locality values', () => {
    for (const pin of ['', '44002', '4400231', '000000', '44002x']) expect(checkPickupArea(pin, 'wadi')).toBe('invalid');
    expect(checkPickupArea('440023', '')).toBe('invalid');
    expect(checkPickupArea('440023', 'dattawadi')).toBe('outside');
  });
  it('leaves unconfirmed business charges and turnaround unset', () => {
    expect(BOOKING_POLICY.pickupFee).toBeNull();
    expect(BOOKING_POLICY.minimumOrder).toBeNull();
    expect(BOOKING_POLICY.turnaroundHours).toEqual({});
  });
});

describe('catalog price units', () => {
  it('distinguishes listed sets from individual garments', () => {
    expect(priceUnitFor('suit2pc-dc')).toBe('set');
    expect(priceUnitFor('kurtapyjama-iron')).toBe('set');
    expect(priceUnitFor('salwarsuit-wash')).toBe('set');
    expect(priceUnitFor('shirt-wash')).toBe('item');
  });
});
