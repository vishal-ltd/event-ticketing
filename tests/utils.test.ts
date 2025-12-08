import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('cn utility', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('merges conflicting tailwind classes', () => {
    // twMerge should keep the last px class
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
