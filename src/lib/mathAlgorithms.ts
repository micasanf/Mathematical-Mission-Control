// Mathematical algorithms for all missions
// Each function includes robust input validation with descriptive error messages

// ─── Shared Validation Helpers ─────────────────────────────────────────────

/** Check if a string is empty or whitespace-only */
function isEmptyOrWhitespace(input: string): boolean {
  return !input || input.trim().length === 0;
}

/** Check if a string contains only digits (optionally with a leading minus) */
function isIntegerString(input: string, allowNegative = false): boolean {
  const pattern = allowNegative ? /^-?\d+$/ : /^\d+$/;
  return pattern.test(input.trim());
}

/** Check if a string is a valid decimal number (contains a dot) */
function isDecimalString(input: string): boolean {
  return /^-?\d+\.\d+$/.test(input.trim());
}

/** Check if a string contains alphabetic characters */
function hasAlphabeticChars(input: string): boolean {
  return /[a-zA-Z]/.test(input);
}

/** Check if a string contains special characters (non-alphanumeric, non-whitespace, non-dot, non-minus) */
function hasSpecialChars(input: string): boolean {
  return /[^a-zA-Z0-9\s.\-]/.test(input);
}

/** Check if a string is alphanumeric (contains both letters and digits) */
function isAlphanumeric(input: string): boolean {
  return /[a-zA-Z]/.test(input) && /\d/.test(input);
}

/** Validate a single integer input for sequence-based missions (fibonacci, tribonacci, lucas, collatz) */
export function validateIntegerInput(
  input: string,
  missionName: string,
  options: {
    allowZero?: boolean;
    allowNegative?: boolean;
    minValue?: number;
    maxValue?: number;
    mustBePositive?: boolean;
  } = {}
): { valid: boolean; error: string | null; parsed: number | null } {
  const {
    allowZero = false,
    allowNegative = false,
    minValue,
    maxValue,
    mustBePositive = false,
  } = options;

  // 1. Empty or blank input
  if (isEmptyOrWhitespace(input)) {
    return {
      valid: false,
      error: mustBePositive
        ? `No input provided. Please enter a positive integer greater than zero.`
        : `No input provided. Please enter a ${allowNegative ? 'non-negative' : 'positive'} integer.`,
      parsed: null,
    };
  }

  const trimmed = input.trim();

  // 2. Letters or text
  if (/^[a-zA-Z]+$/.test(trimmed)) {
    return {
      valid: false,
      error: `Input must be numeric. Letters and text are not valid.`,
      parsed: null,
    };
  }

  // 3. Special characters
  if (hasSpecialChars(trimmed)) {
    return {
      valid: false,
      error: `Input must be numeric. Special characters are not valid.`,
      parsed: null,
    };
  }

  // 4. Alphanumeric strings
  if (isAlphanumeric(trimmed)) {
    return {
      valid: false,
      error: `Input must be a pure integer. Alphanumeric strings containing non-numeric characters are not accepted.`,
      parsed: null,
    };
  }

  // 5. Decimal numbers
  if (isDecimalString(trimmed)) {
    return {
      valid: false,
      error: `Input must be a whole number. Decimal values are not accepted.`,
      parsed: null,
    };
  }

  // 6. Must be a valid integer string at this point
  if (!isIntegerString(trimmed, true)) {
    return {
      valid: false,
      error: `Input must be a valid integer.`,
      parsed: null,
    };
  }

  const n = parseInt(trimmed, 10);

  // 7. Negative integers
  if (n < 0 && !allowNegative) {
    if (mustBePositive) {
      return {
        valid: false,
        error: `Input must be a positive integer. The standard ${missionName} sequence does not accept negative numbers.`,
        parsed: null,
      };
    }
    return {
      valid: false,
      error: `Input must be a ${allowZero ? 'non-negative' : 'positive'} integer. The position or number of terms cannot be negative.`,
      parsed: null,
    };
  }

  // 8. Zero
  if (n === 0 && !allowZero) {
    if (mustBePositive) {
      return {
        valid: false,
        error: `Input must be a positive integer greater than zero. The ${missionName} conjecture is defined for positive integers only.`,
        parsed: null,
      };
    }
    return {
      valid: false,
      error: `Input must be at least 1. There is no ${missionName} term to generate at position zero.`,
      parsed: null,
    };
  }

  // 9. Min/Max range
  if (minValue !== undefined && n < minValue) {
    return {
      valid: false,
      error: `Input must be at least ${minValue}.`,
      parsed: null,
    };
  }
  if (maxValue !== undefined && n > maxValue) {
    return {
      valid: false,
      error: `Input is too large and may exceed memory or processing limits. Use a smaller value (max ${maxValue}).`,
      parsed: null,
    };
  }

  return { valid: true, error: null, parsed: n };
}

/** Validate two integer inputs for dual-input missions (euclidean, division) */
export function validateDualIntegerInput(
  input1: string,
  input2: string,
  missionName: string,
  options: {
    allowZeroFirst?: boolean;
    allowZeroSecond?: boolean;
    allowNegativeFirst?: boolean;
    allowNegativeSecond?: boolean;
    maxValue?: number;
  } = {}
): { valid: boolean; error: string | null; parsed1: number | null; parsed2: number | null } {
  const {
    allowZeroFirst = true,
    allowZeroSecond = true,
    allowNegativeFirst = false,
    allowNegativeSecond = false,
    maxValue,
  } = options;

  // 1. Empty inputs
  if (isEmptyOrWhitespace(input1)) {
    return {
      valid: false,
      error: `No input provided for the first value. Please enter a valid integer.`,
      parsed1: null,
      parsed2: null,
    };
  }
  if (isEmptyOrWhitespace(input2)) {
    return {
      valid: false,
      error: `No input provided for the second value. Please enter a valid integer.`,
      parsed1: null,
      parsed2: null,
    };
  }

  const t1 = input1.trim();
  const t2 = input2.trim();

  // 2. Validate each input for type
  for (const [val, label] of [[t1, 'First'], [t2, 'Second']] as const) {
    if (/^[a-zA-Z]+$/.test(val)) {
      return {
        valid: false,
        error: `${label} input must be numeric. Letters and text are not valid values.`,
        parsed1: null,
        parsed2: null,
      };
    }
    if (hasSpecialChars(val)) {
      return {
        valid: false,
        error: `${label} input must be numeric. Special characters are not valid numeric input.`,
        parsed1: null,
        parsed2: null,
      };
    }
    if (isAlphanumeric(val)) {
      return {
        valid: false,
        error: `Input contains invalid characters. Both inputs must be pure integers.`,
        parsed1: null,
        parsed2: null,
      };
    }
    if (isDecimalString(val)) {
      return {
        valid: false,
        error: `Both inputs must be integers. The ${missionName} is defined for integers only.`,
        parsed1: null,
        parsed2: null,
      };
    }
    if (!isIntegerString(val, true)) {
      return {
        valid: false,
        error: `${label} input must be a valid integer.`,
        parsed1: null,
        parsed2: null,
      };
    }
  }

  const a = parseInt(t1, 10);
  const b = parseInt(t2, 10);

  // 3. Range checks
  if (maxValue !== undefined) {
    if (Math.abs(a) > maxValue) {
      return {
        valid: false,
        error: `First input exceeds the allowed range and may cause overflow or processing errors.`,
        parsed1: null,
        parsed2: null,
      };
    }
    if (Math.abs(b) > maxValue) {
      return {
        valid: false,
        error: `Second input exceeds the allowed range and may cause overflow or processing errors.`,
        parsed1: null,
        parsed2: null,
      };
    }
  }

  return { valid: true, error: null, parsed1: a, parsed2: b };
}


// ─── COLLATZ ────────────────────────────────────────────────────────────────

export function collatzSequence(start: number): number[] {
  const sequence: number[] = [start];
  let current = start;
  while (current !== 1) {
    if (current % 2 === 0) {
      current = current / 2;
    } else {
      current = 3 * current + 1;
    }
    sequence.push(current);
  }
  return sequence;
}

export function collatzSteps(start: number): { step: number; value: number; rule: string }[] {
  const steps: { step: number; value: number; rule: string }[] = [];
  let current = start;
  let step = 0;
  steps.push({ step, value: current, rule: 'Starting value' });
  while (current !== 1) {
    step++;
    if (current % 2 === 0) {
      current = current / 2;
      steps.push({ step, value: current, rule: `${current * 2} is even → ${current * 2} ÷ 2 = ${current}` });
    } else {
      const prev = current;
      current = 3 * current + 1;
      steps.push({ step, value: current, rule: `${prev} is odd → 3 × ${prev} + 1 = ${current}` });
    }
  }
  return steps;
}

/** Validate Collatz input — requires positive integer > 0 */
export function validateCollatzInput(input: string): { valid: boolean; error: string | null; parsed: number | null } {
  return validateIntegerInput(input, 'Collatz', {
    mustBePositive: true,
    allowZero: false,
    allowNegative: false,
    minValue: 1,
    maxValue: 100000,
  });
}


// ─── FIBONACCI ──────────────────────────────────────────────────────────────

export function fibonacciSequence(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const seq: number[] = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

export function fibonacciNth(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 0;
  if (n === 2) return 1;
  let a = 0, b = 1;
  for (let i = 2; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

/** Validate Fibonacci input — requires positive integer >= 1 */
export function validateFibonacciInput(input: string): { valid: boolean; error: string | null; parsed: number | null } {
  return validateIntegerInput(input, 'Fibonacci', {
    allowZero: false,
    allowNegative: false,
    minValue: 1,
    maxValue: 78, // Fibonacci(79) exceeds Number.MAX_SAFE_INTEGER
  });
}


// ─── TRIBONACCI ─────────────────────────────────────────────────────────────

export function tribonacciSequence(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0];
  if (n === 2) return [0, 0];
  const seq: number[] = [0, 0, 1];
  for (let i = 3; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2] + seq[i - 3]);
  }
  return seq.slice(0, n);
}

export function tribonacciNth(n: number): number {
  if (n <= 0) return 0;
  if (n <= 2) return 0;
  if (n === 3) return 1;
  const seq = tribonacciSequence(n);
  return seq[seq.length - 1];
}

/** Validate Tribonacci input — requires positive integer >= 1 */
export function validateTribonacciInput(input: string): { valid: boolean; error: string | null; parsed: number | null } {
  return validateIntegerInput(input, 'Tribonacci', {
    allowZero: false,
    allowNegative: false,
    minValue: 1,
    maxValue: 60, // Tribonacci grows faster than Fibonacci
  });
}


// ─── LUCAS ──────────────────────────────────────────────────────────────────

export function lucasSequence(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [2];
  const seq: number[] = [2, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

export function lucasNth(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 2;
  if (n === 2) return 1;
  let a = 2, b = 1;
  for (let i = 2; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

/** Validate Lucas input — requires non-negative integer >= 0 */
export function validateLucasInput(input: string): { valid: boolean; error: string | null; parsed: number | null } {
  return validateIntegerInput(input, 'Lucas', {
    allowZero: true,
    allowNegative: false,
    maxValue: 76, // Lucas(77) exceeds Number.MAX_SAFE_INTEGER
  });
}


// ─── EUCLIDEAN ──────────────────────────────────────────────────────────────

export function euclideanAlgorithm(a: number, b: number): { gcd: number; steps: { a: number; b: number; quotient: number; remainder: number }[] } {
  const steps: { a: number; b: number; quotient: number; remainder: number }[] = [];
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const quotient = Math.floor(x / y);
    const remainder = x % y;
    steps.push({ a: x, b: y, quotient, remainder });
    x = y;
    y = remainder;
  }
  return { gcd: x, steps };
}

/** Validate Euclidean input — two integers, not both zero, negatives accepted as absolute values */
export function validateEuclideanInput(input1: string, input2: string): { valid: boolean; error: string | null; parsed1: number | null; parsed2: number | null } {
  const result = validateDualIntegerInput(input1, input2, 'Euclidean Algorithm', {
    allowZeroFirst: true,
    allowZeroSecond: true,
    allowNegativeFirst: true,
    allowNegativeSecond: true,
    maxValue: 999999999,
  });

  if (!result.valid) return result;

  // Both zero check
  if (result.parsed1 === 0 && result.parsed2 === 0) {
    return {
      valid: false,
      error: `Both inputs are zero. The GCD of 0 and 0 is undefined. At least one value must be non-zero.`,
      parsed1: null,
      parsed2: null,
    };
  }

  return result;
}


// ─── DIVISION ALGORITHM ─────────────────────────────────────────────────────

export function divisionAlgorithm(dividend: number, divisor: number): { quotient: number; remainder: number; steps: string[] } {
  const steps: string[] = [];
  const absDividend = Math.abs(dividend);
  const absDivisor = Math.abs(divisor);

  if (absDivisor === 0) {
    return { quotient: 0, remainder: 0, steps: ['Division by zero is undefined'] };
  }

  const quotient = Math.floor(absDividend / absDivisor);
  const remainder = absDividend % absDivisor;

  steps.push(`Dividend = ${absDividend}, Divisor = ${absDivisor}`);
  steps.push(`${absDividend} ÷ ${absDivisor} = ${quotient} remainder ${remainder}`);
  steps.push(`Quotient (q) = ${quotient}`);
  steps.push(`Remainder (r) = ${remainder}`);
  steps.push(`Verification: ${absDivisor} × ${quotient} + ${remainder} = ${absDivisor * quotient + remainder} = ${absDividend}`);
  steps.push(`Division Algorithm: a = bq + r where 0 ≤ r < |b|`);
  steps.push(`${absDividend} = ${absDivisor} × ${quotient} + ${remainder}`);

  return { quotient, remainder, steps };
}

/** Validate Division Algorithm input — two integers, divisor cannot be zero, negatives accepted */
export function validateDivisionInput(input1: string, input2: string): { valid: boolean; error: string | null; parsed1: number | null; parsed2: number | null } {
  const result = validateDualIntegerInput(input1, input2, 'Division Algorithm', {
    allowZeroFirst: true,
    allowZeroSecond: false,
    allowNegativeFirst: true,
    allowNegativeSecond: true,
    maxValue: 999999999,
  });

  if (!result.valid) return result;

  // Divisor is zero
  if (result.parsed2 === 0) {
    // Both zero
    if (result.parsed1 === 0) {
      return {
        valid: false,
        error: `Both inputs are zero. Division by zero is undefined regardless of the dividend.`,
        parsed1: null,
        parsed2: null,
      };
    }
    return {
      valid: false,
      error: `Divisor must not be zero. Division by zero is undefined.`,
      parsed1: null,
      parsed2: null,
    };
  }

  return result;
}


// ─── PALINDROME ─────────────────────────────────────────────────────────────

// Palindrome checking algorithm
export function palindromeCheck(input: string): { isPalindrome: boolean; normalized: string; steps: string[] } {
  const steps: string[] = [];

  // Step 1: Remove spaces and convert to lowercase (keep dots for decimal strings like "5.5")
  const normalized = input.replace(/\s/g, '').toLowerCase();
  steps.push(`Original input: "${input}"`);
  steps.push(`Remove spaces and convert to lowercase: "${normalized}"`);

  // Step 2: Check each character pair
  let isPalindrome = true;
  const len = normalized.length;
  steps.push(`String length: ${len} characters`);

  for (let i = 0; i < Math.floor(len / 2); i++) {
    const left = normalized[i];
    const right = normalized[len - 1 - i];
    if (left !== right) {
      steps.push(`Position ${i}: '${left}' ≠ '${right}' (position ${len - 1 - i}) → MISMATCH`);
      isPalindrome = false;
      break;
    } else {
      steps.push(`Position ${i}: '${left}' = '${right}' (position ${len - 1 - i}) ✔`);
    }
  }

  if (isPalindrome) {
    steps.push(`All character pairs match → "${normalized}" IS a palindrome!`);
  } else {
    steps.push(`Mismatch found → "${normalized}" is NOT a palindrome.`);
  }

  return { isPalindrome, normalized, steps };
}

// Validate that input contains only letters, digits, and spaces
export function validatePalindromeInput(input: string): { valid: boolean; error: string | null } {
  // Empty string
  if (input === '') {
    return { valid: false, error: 'Input string must not be empty.' };
  }

  // No input provided (null/undefined)
  if (!input) {
    return { valid: false, error: 'A string or integer argument is required.' };
  }

  // Whitespace-only — treated as a palindrome per spec, but we check for only-spaces
  // Actually per spec: "Whitespace-only strings are accepted and treated as palindromes"
  // But we still need at least something. Empty is different from whitespace.
  if (input.trim().length === 0 && input.length > 0) {
    // Whitespace only — this IS valid, it's a palindrome
    return { valid: true, error: null };
  }

  // Check for special characters (only letters, digits, dots, and spaces allowed)
  const invalidChars = /[^a-zA-Z0-9.\s]/;
  if (invalidChars.test(input)) {
    const found = input.match(/[^a-zA-Z0-9.\s]/g);
    return { valid: false, error: `Special character${found && found.length > 1 ? 's' : ''} not allowed: "${[...new Set(found)].join('", "')}". Only letters, digits, dots, and spaces are accepted.` };
  }

  // Check that there's at least one letter, digit, or dot
  if (!/[a-zA-Z0-9.]/.test(input)) {
    return { valid: false, error: 'Please enter at least one letter, digit, or number. Spaces alone are not valid input.' };
  }

  return { valid: true, error: null };
}
