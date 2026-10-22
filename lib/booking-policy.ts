/** Business settings live here so confirmed fees and timings can be added once. */
export const BOOKING_POLICY = {
  pickupArea: 'wadi',
  // Wadi S.O: Government postal-office directory.
  // https://rect.crpf.gov.in/Upload/Recruitment/ATTACHMENTS/29_1/1_2910216.pdf
  pickupPincodes: ['440023'] as readonly string[],
  pickupFee: null as number | null,
  minimumOrder: null as number | null,
  turnaroundHours: {} as Record<string, number | undefined>,
};

export type PickupAreaResult = 'invalid' | 'outside' | 'eligible';

export function checkPickupArea(pin: string, locality: string): PickupAreaResult {
  if (!/^[1-9]\d{5}$/.test(pin) || !locality) return 'invalid';
  // A matching postal district must never admit an explicitly non-Wadi address.
  return locality === BOOKING_POLICY.pickupArea && BOOKING_POLICY.pickupPincodes.includes(pin)
    ? 'eligible'
    : 'outside';
}

export function priceUnitFor(itemId: string): 'item' | 'set' {
  return /^(suit[23]pc|kurtapyjama|salwarsuit)-/.test(itemId) ? 'set' : 'item';
}

export const MAX_QUANTITY = 99;
