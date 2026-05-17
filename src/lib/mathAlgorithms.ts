// Mathematical algorithms for all missions

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

// Palindrome checking algorithm
export function palindromeCheck(input: string): { isPalindrome: boolean; normalized: string; steps: string[] } {
  const steps: string[] = [];
  
  // Step 1: Remove spaces and convert to lowercase
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
      steps.push(`Position ${i}: '${left}' = '${right}' (position ${len - 1 - i}) ✓`);
    }
  }
  
  if (isPalindrome) {
    steps.push(`All character pairs match → "${normalized}" IS a palindrome!`);
  } else {
    steps.push(`Mismatch found → "${normalized}" is NOT a palindrome.`);
  }
  
  return { isPalindrome, normalized, steps };
}

// Validate that input contains only letters and spaces
export function validatePalindromeInput(input: string): { valid: boolean; error: string | null } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'Please enter a word or phrase. Empty input is not accepted.' };
  }
  
  // Check for special characters and numbers
  const invalidChars = /[^a-zA-Z\s]/;
  if (invalidChars.test(input)) {
    const found = input.match(/[^a-zA-Z\s]/g);
    return { valid: false, error: `Special character${found && found.length > 1 ? 's' : ''} not allowed: "${[...new Set(found)].join('", "')}". Only letters and spaces are accepted.` };
  }
  
  // Check that there's at least one letter
  if (!/[a-zA-Z]/.test(input)) {
    return { valid: false, error: 'Please enter at least one letter. Spaces alone are not valid input.' };
  }
  
  return { valid: true, error: null };
}
