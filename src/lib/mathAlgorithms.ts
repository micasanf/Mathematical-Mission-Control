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

/** Validate Collatz input — requires odd positive integer > 0 */
export function validateCollatzInput(input: string): { valid: boolean; error: string | null; parsed: number | null } {
  const result = validateIntegerInput(input, 'Collatz', {
    mustBePositive: true,
    allowZero: false,
    allowNegative: false,
    minValue: 1,
    maxValue: 100000,
  });

  if (!result.valid) return result;

  // Must be odd
  if (result.parsed !== null && result.parsed % 2 === 0) {
    return {
      valid: false,
      error: `Input must be an odd positive integer. Even numbers are not accepted as starting values.`,
      parsed: null,
    };
  }

  return result;
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

/** Validate Fibonacci input — requires positive integer > 2 (per lab spec: valid input is greater than 2) */
export function validateFibonacciInput(input: string): { valid: boolean; error: string | null; parsed: number | null } {
  return validateIntegerInput(input, 'Fibonacci', {
    allowZero: false,
    allowNegative: false,
    minValue: 3,
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

/** Validate Tribonacci input — requires positive integer > 3 (per lab spec: valid input is greater than 3) */
export function validateTribonacciInput(input: string): { valid: boolean; error: string | null; parsed: number | null } {
  return validateIntegerInput(input, 'Tribonacci', {
    allowZero: false,
    allowNegative: false,
    minValue: 4,
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

/** Validate Lucas input — requires positive integer > 2 (per lab spec: valid input is greater than 2) */
export function validateLucasInput(input: string): { valid: boolean; error: string | null; parsed: number | null } {
  return validateIntegerInput(input, 'Lucas', {
    allowZero: false,
    allowNegative: false,
    minValue: 3,
    maxValue: 76, // Lucas(77) exceeds Number.MAX_SAFE_INTEGER
  });
}


// ─── EUCLIDEAN ──────────────────────────────────────────────────────────────

// The Euclidean Algorithm:
// Let m and n be positive integers with n < m. Let
//   m = n·q₁ + r₁
//   n = r₁·q₂ + r₂
//   r₁ = r₂·q₃ + r₃
//   …
//   r_{N-1} = r_N·q_N
// be the result of iterating the Division Algorithm, where r_N is the last non-zero remainder.
// Then gcd(m, n) = r_N.
//
// The GCD and LCM are related by: lcm(m, n) = (m · n) / gcd(m, n)

export function euclideanAlgorithm(m: number, n: number): { gcd: number; lcm: number; steps: { dividend: number; divisor: number; quotient: number; remainder: number }[]; stepStrings: string[] } {
  const steps: { dividend: number; divisor: number; quotient: number; remainder: number }[] = [];
  const stepStrings: string[] = [];

  // Ensure m > n per theorem: "Let m and n be positive integers with n < m"
  let big = m >= n ? m : n;
  let small = m >= n ? n : m;

  // Iterate the Division Algorithm
  let stepNum = 1;
  while (small !== 0) {
    const q = Math.floor(big / small);
    const r = big % small;
    steps.push({ dividend: big, divisor: small, quotient: q, remainder: r });

    if (r === 0) {
      stepStrings.push(`${big} = ${small}(${q})`);
    } else {
      stepStrings.push(`${big} = ${small}(${q}) + ${r}`);
    }

    big = small;
    small = r;
    stepNum++;
  }

  // gcd = last non-zero remainder = the last divisor before remainder became 0
  const gcd = big;
  // lcm(m, n) = (m · n) / gcd(m, n)
  const lcm = (m * n) / gcd;

  return { gcd, lcm, steps, stepStrings };
}

/** Validate Euclidean input — two positive integers m and n with n < m, per theorem */
export function validateEuclideanInput(input1: string, input2: string): { valid: boolean; error: string | null; parsed1: number | null; parsed2: number | null } {
  const result = validateDualIntegerInput(input1, input2, 'Euclidean Algorithm', {
    allowZeroFirst: false,
    allowZeroSecond: false,
    allowNegativeFirst: false,
    allowNegativeSecond: false,
    maxValue: 999999999,
  });

  if (!result.valid) return result;

  // Both zero check
  if (result.parsed1 === 0 && result.parsed2 === 0) {
    return {
      valid: false,
      error: `Both inputs are zero. The theorem requires m and n to be positive integers.`,
      parsed1: null,
      parsed2: null,
    };
  }

  return result;
}


// ─── DIVISION ALGORITHM ─────────────────────────────────────────────────────

export function divisionAlgorithm(m: number, n: number): { quotient: number; remainder: number; steps: string[]; m: number; n: number } {
  const steps: string[] = [];

  // Division Algorithm Theorem:
  // Let m and n be positive integers. There exist non-negative integers q and r,
  // with 0 <= r < n, such that m = nq + r.
  // Here, q is the quotient when m is divided by n, and r is the remainder.

  if (n === 0) {
    return { quotient: 0, remainder: 0, steps: ['Division by zero is undefined'], m, n: 0 };
  }

  // Compute quotient q and remainder r: m = nq + r, where 0 ≤ r < n
  const q = Math.floor(m / n);
  const r = m % n;

  steps.push(`SOLUTION:`);
  steps.push(`Let m = ${m} and n = ${n} be positive integers.`);
  steps.push(`By the Division Algorithm, there exist non-negative integers q and r`);
  steps.push(`such that m = nq + r, where 0 ≤ r < n.`);
  steps.push(``);
  steps.push(`${m} = ${n}(${q})${r > 0 ? ` + ${r}` : ''}`);
  steps.push(`The quotient q = ${q}${r > 0 ? ` and the remainder r = ${r}` : r === 0 ? ` and the remainder r = 0` : ''}`);
  if (r > 0) {
    steps.push(`Check: 0 ≤ ${r} < ${n} ✔`);
  }

  return { quotient: q, remainder: r, steps, m, n };
}

/** Validate Division Algorithm input — two positive integers m and n (per theorem: m and n are positive integers) */
export function validateDivisionInput(input1: string, input2: string): { valid: boolean; error: string | null; parsed1: number | null; parsed2: number | null } {
  const result = validateDualIntegerInput(input1, input2, 'Division Algorithm', {
    allowZeroFirst: false,
    allowZeroSecond: false,
    allowNegativeFirst: false,
    allowNegativeSecond: false,
    maxValue: 999999999,
  });

  if (!result.valid) return result;

  // n (divisor) must be positive — both m and n must be positive integers per theorem
  if (result.parsed2 === 0) {
    if (result.parsed1 === 0) {
      return {
        valid: false,
        error: `Both inputs are zero. The theorem requires m and n to be positive integers.`,
        parsed1: null,
        parsed2: null,
      };
    }
    return {
      valid: false,
      error: `n must be a positive integer. Division by zero is undefined, and the theorem requires n > 0.`,
      parsed1: null,
      parsed2: null,
    };
  }

  // m must be positive per theorem
  if (result.parsed1 !== null && result.parsed1 <= 0) {
    return {
      valid: false,
      error: `m must be a positive integer. The theorem states: "Let m and n be positive integers."`,
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

  // Step 1: Remove spaces and convert to lowercase — keep ALL other characters (letters, digits, punctuation, special chars)
  const normalized = input.replace(/\s/g, '').toLowerCase();
  steps.push(`Original input: "${input}"`);
  steps.push(`Remove spaces and convert to lowercase: "${normalized}"`);

  // Step 2: Check each character pair
  let isPalindrome = true;
  const len = normalized.length;
  steps.push(`String length: ${len} characters`);

  if (len === 0) {
    steps.push(`No characters to compare.`);
    return { isPalindrome: true, normalized, steps };
  }

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

// Validate palindrome input — accept any characters (letters, digits, special chars, spaces)
export function validatePalindromeInput(input: string): { valid: boolean; error: string | null } {
  // Empty string
  if (input === '') {
    return { valid: false, error: 'Input string must not be empty.' };
  }

  // No input provided (null/undefined)
  if (!input) {
    return { valid: false, error: 'A string or integer argument is required.' };
  }

  // Whitespace-only — treated as a palindrome per spec
  if (input.trim().length === 0 && input.length > 0) {
    return { valid: true, error: null };
  }

  return { valid: true, error: null };
}
