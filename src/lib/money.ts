const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

/** Format integer paise as an INR display string (en-IN grouping). */
export function formatInr(paise: number): string {
  if (!Number.isInteger(paise)) {
    throw new Error('Invalid amount: paise must be an integer')
  }
  return inrFormatter.format(paise / 100)
}

/**
 * Parse a user-entered INR amount (optional commas, optional ₹) into integer paise.
 * Rounds to nearest paise when more than two decimal places are present.
 */
export function parseInrToPaise(input: string): number {
  const normalized = input.trim().replace(/₹/g, '').replace(/,/g, '')
  if (!normalized) {
    throw new Error('Invalid amount')
  }
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    throw new Error('Invalid amount')
  }
  const rupees = Number(normalized)
  if (!Number.isFinite(rupees)) {
    throw new Error('Invalid amount')
  }
  return Math.round(rupees * 100)
}
