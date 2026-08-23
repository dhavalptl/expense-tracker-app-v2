import { describe, expect, it } from 'vitest'

import { formatInr, parseInrToPaise } from './money.ts'

describe('formatInr', () => {
  it('formats zero paise as ₹0.00', () => {
    expect(formatInr(0)).toBe('₹0.00')
  })

  it('formats 100 paise as ₹1.00', () => {
    expect(formatInr(100)).toBe('₹1.00')
  })

  it('formats fractional rupees with paise', () => {
    expect(formatInr(10050)).toBe('₹100.50')
  })

  it('uses Indian grouping for lakhs', () => {
    expect(formatInr(10_000_000)).toBe('₹1,00,000.00')
  })
})

describe('parseInrToPaise', () => {
  it('parses whole rupees to paise', () => {
    expect(parseInrToPaise('1')).toBe(100)
  })

  it('parses rupees with paise', () => {
    expect(parseInrToPaise('100.50')).toBe(10050)
  })

  it('parses values with Indian grouping commas', () => {
    expect(parseInrToPaise('1,00,000.00')).toBe(10_000_000)
  })

  it('rejects empty input', () => {
    expect(() => parseInrToPaise('')).toThrow(/invalid/i)
  })

  it('rejects non-numeric input', () => {
    expect(() => parseInrToPaise('abc')).toThrow(/invalid/i)
  })
})
