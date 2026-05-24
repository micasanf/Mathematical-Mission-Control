// Mission data for all 6 topics

export interface MissionData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  overview: string;
  formula: string;
  formulaDescription: string;
  workedExample: { title: string; steps: string[] };
  simulatorLabel: string;
  simulatorPlaceholder: string;
  applications: string[];
  history: string;
  quiz: { question: string; options: string[]; correct: number }[];
}

export const missions: MissionData[] = [
  {
    id: 'collatz',
    title: 'Mission Collatz',
    subtitle: 'The Unstoppable Sequence',
    description: 'Explore the mysterious Collatz conjecture — will every starting number eventually reach 1?',
    icon: 'C',
    color: 'solar',
    overview: `The Collatz conjecture is one of mathematics' most famous unsolved problems. Proposed by Lothar Collatz in 1937, it states that if you start with any positive integer and repeatedly apply two simple rules, you will always eventually reach 1.\n\nThe rules are:\n• If the number is even, divide it by 2\n• If the number is odd, multiply it by 3 and add 1\n\nDespite its simplicity, no one has been able to prove that this always works for every starting number. The conjecture has been verified for all starting values up to at least 2⁶⁸ (approximately 2.95 × 10²⁰), but a formal proof remains elusive.`,
    formula: 'f(n) = \\begin{cases} n/2 & \\text{if } n \\text{ is even} \\\\ 3n+1 & \\text{if } n \\text{ is odd} \\end{cases}',
    formulaDescription: 'The Collatz function applies one of two operations depending on whether the input is even or odd. The conjecture states that repeated application always reaches the cycle 4 → 2 → 1.',
    workedExample: {
      title: 'Starting with n = 6',
      steps: [
        'n = 6 (even) → 6 ÷ 2 = 3',
        'n = 3 (odd) → 3 × 3 + 1 = 10',
        'n = 10 (even) → 10 ÷ 2 = 5',
        'n = 5 (odd) → 5 × 3 + 1 = 16',
        'n = 16 (even) → 16 ÷ 2 = 8',
        'n = 8 (even) → 8 ÷ 2 = 4',
        'n = 4 (even) → 4 ÷ 2 = 2',
        'n = 2 (even) → 2 ÷ 2 = 1 [OK]',
        'Sequence: 6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1',
        'Total steps: 8'
      ]
    },
    simulatorLabel: 'Starting Integer',
    simulatorPlaceholder: 'Enter a positive integer (e.g., 27)',
    applications: [
      'Number theory research and mathematical conjecture verification',
      'Computational mathematics and algorithm complexity analysis',
      'Halting problem studies in computer science',
      'Pseudorandom number generation',
      'Educational tool for teaching algorithmic thinking'
    ],
    history: 'The Collatz conjecture was first proposed by German mathematician Lothar Collatz in 1937. It is also known as the 3n+1 problem, the Ulam conjecture (after Stanisław Ulam), Kakutani\'s problem, and the Syracuse problem. Paul Erdős famously said about the conjecture: "Mathematics may not be ready for such problems." Despite decades of study and verification for enormous numbers, the conjecture remains unproven, making it one of the most intriguing open problems in mathematics.',
    quiz: [
      { question: 'What is the first step when applying the Collatz function to n = 7?', options: ['7 ÷ 2 = 3.5', '3 × 7 + 1 = 22', '7 + 1 = 8', '7 - 1 = 6'], correct: 1 },
      { question: 'What happens when you apply the Collatz function to an even number?', options: ['Multiply by 3 and add 1', 'Divide by 2', 'Subtract 1', 'Add 1'], correct: 1 },
      { question: 'What is the Collatz sequence starting from n = 4?', options: ['4 → 2 → 1', '4 → 12 → 6 → 3 → 10 → 5 → 16 → 8 → 4', '4 → 1', '4 → 8 → 16 → 32'], correct: 0 },
      { question: 'Has the Collatz conjecture been proven?', options: ['Yes, in 1995', 'Yes, in 2019', 'No, it remains unproven', 'It was disproven in 2005'], correct: 2 },
      { question: 'What number does every Collatz sequence supposedly reach?', options: ['0', '2', '1', '3'], correct: 2 },
      { question: 'Who proposed the Collatz conjecture?', options: ['Leonhard Euler', 'Lothar Collatz', 'Carl Friedrich Gauss', 'Stanisław Ulam'], correct: 1 },
      { question: 'What is the Collatz sequence for n = 10?', options: ['10 → 5 → 16 → 8 → 4 → 2 → 1', '10 → 30 → 15 → 46 → 23 → 70', '10 → 5 → 15 → 45 → 135', '10 → 20 → 40 → 80'], correct: 0 },
    ]
  },
  {
    id: 'fibonacci',
    title: 'Mission Fibonacci',
    subtitle: 'Nature\'s Golden Code',
    description: 'Discover the Fibonacci sequence — the mathematical pattern found throughout nature.',
    icon: 'F',
    color: 'quantum',
    overview: `The Fibonacci sequence is one of the most famous and beautiful sequences in mathematics. Each number is the sum of the two preceding ones, starting from 0 and 1.\n\nThe sequence begins: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...\n\nThis sequence appears throughout nature — in the arrangement of leaves on stems, the spirals of shells, the branching of trees, and the flowering of artichokes. The ratio of consecutive Fibonacci numbers approaches the golden ratio (φ ≈ 1.6180339887...), a proportion that has fascinated artists and architects for millennia.`,
    formula: 'F_n = F_{n-1} + F_{n-2}, \\quad F_0 = 0, \\quad F_1 = 1',
    formulaDescription: 'Each Fibonacci number is the sum of the two preceding numbers, with seed values F₀ = 0 and F₁ = 1. The closed-form expression (Binet\'s formula) involves the golden ratio: F_n = (φⁿ - ψⁿ) / √5, where φ = (1+√5)/2 and ψ = (1-√5)/2.',
    workedExample: {
      title: 'Computing the first 10 Fibonacci numbers',
      steps: [
        'F(0) = 0 (seed value)',
        'F(1) = 1 (seed value)',
        'F(2) = F(1) + F(0) = 1 + 0 = 1',
        'F(3) = F(2) + F(1) = 1 + 1 = 2',
        'F(4) = F(3) + F(2) = 2 + 1 = 3',
        'F(5) = F(4) + F(3) = 3 + 2 = 5',
        'F(6) = F(5) + F(4) = 5 + 3 = 8',
        'F(7) = F(6) + F(5) = 8 + 5 = 13',
        'F(8) = F(7) + F(6) = 13 + 8 = 21',
        'F(9) = F(8) + F(7) = 21 + 13 = 34',
      ]
    },
    simulatorLabel: 'Number of terms',
    simulatorPlaceholder: 'Enter n (e.g., 10)',
    applications: [
      'Golden ratio in art, architecture, and design',
      'Financial markets — Fibonacci retracement in technical analysis',
      'Computer algorithms — Fibonacci heap data structure',
      'Biology — phyllotaxis (arrangement of leaves and petals)',
      'Agile development — Fibonacci-based story point estimation'
    ],
    history: 'The sequence was introduced to Western European mathematics by Leonardo of Pisa, known as Fibonacci, in his 1202 book Liber Abaci. However, the sequence had been described in Indian mathematics as early as 200 BC by Pingala. Fibonacci used it to describe the growth of an idealized rabbit population. The connection to the golden ratio was established by Johannes Kepler in the 17th century, and Binet\'s formula was derived by Jacques Philippe Marie Binet in 1843.',
    quiz: [
      { question: 'What are the first two Fibonacci numbers?', options: ['1, 1', '0, 1', '1, 2', '0, 2'], correct: 1 },
      { question: 'What is F(10)?', options: ['34', '55', '89', '144'], correct: 1 },
      { question: 'What ratio do consecutive Fibonacci numbers approach?', options: ['π (3.14159...)', 'e (2.71828...)', 'φ (1.61803...)', '√2 (1.41421...)'], correct: 2 },
      { question: 'Who introduced the Fibonacci sequence to Western European mathematics?', options: ['Leonardo da Vinci', 'Leonardo of Pisa (Fibonacci)', 'Galileo Galilei', 'Isaac Newton'], correct: 1 },
      { question: 'What is F(7)?', options: ['8', '13', '21', '34'], correct: 1 },
      { question: 'In what book was the Fibonacci sequence first described in Western mathematics?', options: ['Principia Mathematica', 'Liber Abaci', 'Elements', 'Ars Magna'], correct: 1 },
      { question: 'What is the sum of the first 5 Fibonacci numbers (F(0) to F(4))?', options: ['5', '7', '10', '12'], correct: 1 },
    ]
  },
  {
    id: 'tribonacci',
    title: 'Mission Tribonacci',
    subtitle: 'The Triple Helix',
    description: 'Explore the Tribonacci sequence — where each term depends on three predecessors.',
    icon: 'T',
    color: 'nova',
    overview: `The Tribonacci sequence is a generalization of the Fibonacci sequence. Instead of each number being the sum of the two preceding numbers, each Tribonacci number is the sum of the three preceding numbers.\n\nThe sequence begins: 0, 0, 1, 1, 2, 4, 7, 13, 24, 44, 81, 149, 274, 504, 927, ...\n\nJust as the Fibonacci sequence is connected to the golden ratio, the Tribonacci sequence is connected to the tribonacci constant — the real root of x³ = x² + x + 1, approximately 1.839286755....`,
    formula: 'T_n = T_{n-1} + T_{n-2} + T_{n-3}, \\quad T_0 = 0, \\quad T_1 = 0, \\quad T_2 = 1',
    formulaDescription: 'Each Tribonacci number is the sum of the three preceding numbers, with seed values T₀ = 0, T₁ = 0, and T₂ = 1. The ratio of consecutive terms converges to the tribonacci constant ≈ 1.8392867552.',
    workedExample: {
      title: 'Computing the first 10 Tribonacci numbers',
      steps: [
        'T(0) = 0 (seed value)',
        'T(1) = 0 (seed value)',
        'T(2) = 1 (seed value)',
        'T(3) = T(2) + T(1) + T(0) = 1 + 0 + 0 = 1',
        'T(4) = T(3) + T(2) + T(1) = 1 + 1 + 0 = 2',
        'T(5) = T(4) + T(3) + T(2) = 2 + 1 + 1 = 4',
        'T(6) = T(5) + T(4) + T(3) = 4 + 2 + 1 = 7',
        'T(7) = T(6) + T(5) + T(4) = 7 + 4 + 2 = 13',
        'T(8) = T(7) + T(6) + T(5) = 13 + 7 + 4 = 24',
        'T(9) = T(8) + T(7) + T(6) = 24 + 13 + 7 = 44',
      ]
    },
    simulatorLabel: 'Number of terms',
    simulatorPlaceholder: 'Enter n (e.g., 10)',
    applications: [
      'Combinatorics — counting certain types of sequences',
      'Computer science — analysis of ternary algorithms',
      'Number theory — generalization studies of recurrence relations',
      'Physics — certain lattice models in statistical mechanics',
      'Probability — modeling trinomial distributions'
    ],
    history: 'The Tribonacci sequence was studied by Mark Feinberg in 1963 while he was a 14-year-old high school student. His paper "Fibonacci-Tribonacci" was published in The Fibonacci Quarterly. The sequence had appeared earlier in the work of Édouard Lucas. The tribonacci constant (the limiting ratio) is the only real root of x³ - x² - x - 1 = 0, approximately 1.83929.',
    quiz: [
      { question: 'How many preceding numbers does each Tribonacci number sum?', options: ['Two', 'Three', 'Four', 'One'], correct: 1 },
      { question: 'What is T(6)?', options: ['4', '7', '13', '24'], correct: 1 },
      { question: 'What are the seed values of the Tribonacci sequence?', options: ['0, 0, 1', '1, 1, 1', '0, 1, 1', '1, 2, 3'], correct: 0 },
      { question: 'What constant do consecutive Tribonacci ratios approach?', options: ['1.618 (golden ratio)', '1.839 (tribonacci constant)', '2.414 (silver ratio)', '3.0'], correct: 1 },
      { question: 'Who studied the Tribonacci sequence as a teenager?', options: ['Mark Feinberg', 'Lothar Collatz', 'Édouard Lucas', 'Leonardo of Pisa'], correct: 0 },
      { question: 'What is T(7)?', options: ['7', '13', '24', '44'], correct: 1 },
      { question: 'What polynomial has the tribonacci constant as its real root?', options: ['x² - x - 1 = 0', 'x³ - x² - x - 1 = 0', 'x³ - 2x - 1 = 0', 'x⁴ - x³ - x² - x - 1 = 0'], correct: 1 },
    ]
  },
  {
    id: 'lucas',
    title: 'Mission Lucas',
    subtitle: 'The Parallel Universe',
    description: 'Discover the Lucas sequence — Fibonacci\'s lesser-known twin with surprising properties.',
    icon: 'L',
    color: 'pulsar',
    overview: `The Lucas sequence is closely related to the Fibonacci sequence but starts with different seed values: L₀ = 2 and L₁ = 1 instead of 0 and 1.\n\nThe sequence begins: 2, 1, 3, 4, 7, 11, 18, 29, 47, 76, 123, 199, 322, 521, 843, ...\n\nLike the Fibonacci sequence, the ratio of consecutive Lucas numbers approaches the golden ratio φ. The Lucas numbers have an intimate relationship with Fibonacci numbers — for example, L(n) = F(n-1) + F(n+1), and L(n) = F(n) + 2F(n-1).`,
    formula: 'L_n = L_{n-1} + L_{n-2}, \\quad L_0 = 2, \\quad L_1 = 1',
    formulaDescription: 'Each Lucas number is the sum of the two preceding numbers, with seed values L₀ = 2 and L₁ = 1. The relationship to Fibonacci: L(n) = F(n-1) + F(n+1). Like Fibonacci, the ratio converges to the golden ratio φ.',
    workedExample: {
      title: 'Computing the first 10 Lucas numbers',
      steps: [
        'L(0) = 2 (seed value)',
        'L(1) = 1 (seed value)',
        'L(2) = L(1) + L(0) = 1 + 2 = 3',
        'L(3) = L(2) + L(1) = 3 + 1 = 4',
        'L(4) = L(3) + L(2) = 4 + 3 = 7',
        'L(5) = L(4) + L(3) = 7 + 4 = 11',
        'L(6) = L(5) + L(4) = 11 + 7 = 18',
        'L(7) = L(6) + L(5) = 18 + 11 = 29',
        'L(8) = L(7) + L(6) = 29 + 18 = 47',
        'L(9) = L(8) + L(7) = 47 + 29 = 76',
      ]
    },
    simulatorLabel: 'Number of terms',
    simulatorPlaceholder: 'Enter n (e.g., 10)',
    applications: [
      'Primality testing — Lucas-Lehmer test for Mersenne primes',
      'Cryptography — Lucas sequences in public-key cryptosystems',
      'Number theory — relationship to Fibonacci and golden ratio',
      'Coding theory — error-correcting codes',
      'Algorithm design — efficient computation methods'
    ],
    history: 'The Lucas sequence is named after French mathematician Édouard Lucas (1842–1891), who studied both this sequence and the Fibonacci sequence extensively. Lucas is also known for the Tower of Hanoi puzzle and for proving that the Mersenne number M₁₂₇ = 2¹²⁷ − 1 is prime (the largest known prime for 75 years). He developed the Lucas-Lehmer primality test, which is still used today to find the largest known primes.',
    quiz: [
      { question: 'What are the seed values of the Lucas sequence?', options: ['0, 1', '1, 1', '2, 1', '1, 2'], correct: 2 },
      { question: 'What is L(5)?', options: ['7', '11', '18', '4'], correct: 1 },
      { question: 'What is the relationship L(n) = F(n-1) + F(n+1) an example of?', options: ['Addition rule', 'Connection to Fibonacci', 'Golden ratio property', 'Divisibility rule'], correct: 1 },
      { question: 'Who is the Lucas sequence named after?', options: ['George Lucas', 'Édouard Lucas', 'Lucas Cranach', 'Henry Lucas'], correct: 1 },
      { question: 'What ratio do consecutive Lucas numbers approach?', options: ['π', 'e', 'φ (golden ratio)', '√3'], correct: 2 },
      { question: 'What is L(0)?', options: ['0', '1', '2', '3'], correct: 2 },
      { question: 'What famous puzzle did Édouard Lucas invent?', options: ['Rubik\'s Cube', 'Tower of Hanoi', 'Sudoku', 'Crossword'], correct: 1 },
    ]
  },
  {
    id: 'euclidean',
    title: 'Mission Euclid',
    subtitle: 'The Ancient Algorithm',
    description: 'Master the Euclidean Algorithm — the oldest and most elegant method for finding GCD.',
    icon: 'E',
    color: 'crimson',
    overview: `The Euclidean Algorithm is one of the oldest algorithms still in common use. It efficiently computes the Greatest Common Divisor (GCD) of two numbers — the largest number that divides both without a remainder.\n\nThe algorithm is based on the principle that the GCD of two numbers also divides their difference. More practically, if we divide the larger number by the smaller and take the remainder, the GCD of the original pair equals the GCD of the smaller number and the remainder.\n\nThis process is repeated until the remainder is zero, at which point the last non-zero remainder is the GCD.`,
    formula: '\\gcd(a, b) = \\gcd(b, a \\bmod b), \\quad \\gcd(a, 0) = a',
    formulaDescription: 'The Euclidean algorithm replaces the larger number with the remainder of dividing the larger by the smaller. This continues until the remainder is 0. The Extended Euclidean Algorithm also finds integers x, y such that ax + by = gcd(a,b).',
    workedExample: {
      title: 'Finding GCD(48, 18)',
      steps: [
        'GCD(48, 18): 48 ÷ 18 = 2 remainder 12',
        'GCD(18, 12): 18 ÷ 12 = 1 remainder 6',
        'GCD(12, 6): 12 ÷ 6 = 2 remainder 0',
        'GCD = 6 (last non-zero remainder)',
        'Verification: 48 = 6 × 8 [OK] and 18 = 6 × 3 [OK]',
        'Extended: 6 = 18 × 1 - 48 × (−(2)) → 6 = (-1)(48) + (3)(18)'
      ]
    },
    simulatorLabel: 'Two Integers (comma-separated)',
    simulatorPlaceholder: 'Enter two positive integers (e.g., 48, 18)',
    applications: [
      'Simplifying fractions to lowest terms',
      'Cryptography — RSA key generation relies on GCD computations',
      'Computer science — modular arithmetic and inverse computation',
      'Music theory — finding common rhythmic patterns',
      'Signal processing — sampling rate conversion'
    ],
    history: 'The Euclidean Algorithm appears in Euclid\'s Elements (Book VII, Propositions 1–2), written around 300 BC, making it one of the oldest algorithms still in use. The algorithm was likely known even earlier. In the 19th century, it was extended to find the Bézout coefficients (Extended Euclidean Algorithm). The algorithm is fundamental to modern computational number theory and is used extensively in cryptographic systems like RSA.',
    quiz: [
      { question: 'What does the Euclidean Algorithm find?', options: ['Least Common Multiple', 'Greatest Common Divisor', 'Prime factors', 'Square root'], correct: 1 },
      { question: 'What is GCD(56, 98)?', options: ['7', '14', '28', '2'], correct: 1 },
      { question: 'When does the Euclidean Algorithm terminate?', options: ['When both numbers are equal', 'When the remainder is 0', 'When the quotient is 1', 'After 10 steps'], correct: 1 },
      { question: 'In what ancient text does the Euclidean Algorithm appear?', options: ['The Art of War', 'Euclid\'s Elements', 'The Republic', 'Arithmetica'], correct: 1 },
      { question: 'What is GCD(17, 13)?', options: ['1', '13', '17', '221'], correct: 0 },
      { question: 'What does the Extended Euclidean Algorithm additionally find?', options: ['Prime factorization', 'Bézout coefficients', 'Modular square root', 'Least common multiple'], correct: 1 },
      { question: 'How old is the Euclidean Algorithm (approximately)?', options: ['500 years', '1000 years', '2300 years', '3000 years'], correct: 2 },
    ]
  },
  {
    id: 'division',
    title: 'Mission Division',
    subtitle: 'The Foundation of Arithmetic',
    description: 'Understand the Division Algorithm — the fundamental theorem that underlies all of arithmetic.',
    icon: 'D',
    color: 'warp',
    overview: `The Division Algorithm (also called the Division Theorem) states that for any integers a and b (where b > 0), there exist unique integers q (quotient) and r (remainder) such that:\n\na = bq + r, where 0 ≤ r < b\n\nThis seemingly simple statement is actually a profound result that forms the basis for much of number theory, including the Euclidean Algorithm, modular arithmetic, and the fundamental theorem of arithmetic.\n\nIt guarantees that division always "works out" with a unique quotient and remainder, even when we restrict ourselves to integers.`,
    formula: 'a = bq + r, \\quad \\text{where } 0 \\leq r < |b|',
    formulaDescription: 'For integers a (dividend) and b (divisor, b ≠ 0), there exist unique integers q (quotient) and r (remainder) such that a = bq + r with 0 ≤ r < |b|. The quotient q = ⌊a/b⌋ and remainder r = a - bq.',
    workedExample: {
      title: 'Applying the Division Algorithm to a = 43, b = 7',
      steps: [
        'Dividend a = 43, Divisor b = 7',
        '43 ÷ 7 = 6 remainder 1',
        'Quotient q = 6',
        'Remainder r = 1',
        'Verification: a = bq + r -> 43 = 7 x 6 + 1 = 42 + 1 = 43 [OK]',
        'Check: 0 <= r < |b| -> 0 <= 1 < 7 [OK]'
      ]
    },
    simulatorLabel: 'Dividend and Divisor (comma-separated)',
    simulatorPlaceholder: 'e.g., 43, 7',
    applications: [
      'Modular arithmetic and congruence relations',
      'Cryptography — modular exponentiation',
      'Computer science — hash functions and checksums',
      'Calendar calculations — determining days of the week',
      'Digital signal processing — circular buffers'
    ],
    history: 'The Division Algorithm, while named as an "algorithm," is actually a theorem that guarantees the existence and uniqueness of quotient and remainder. The concept of division with remainder is ancient — it was used by Babylonian mathematicians around 2000 BC. The formal statement and proof appear in Euclid\'s Elements. The theorem is fundamental to the development of modular arithmetic by Carl Friedrich Gauss in his Disquisitiones Arithmeticae (1801).',
    quiz: [
      { question: 'In the Division Algorithm a = bq + r, what constraint must r satisfy?', options: ['r > b', '0 ≤ r < |b|', 'r = 0', 'r < 0'], correct: 1 },
      { question: 'If a = 37 and b = 5, what are q and r?', options: ['q = 6, r = 7', 'q = 8, r = -3', 'q = 7, r = 1', 'q = 7, r = 2'], correct: 3 },
      { question: 'What does the Division Algorithm guarantee about q and r?', options: ['They are positive', 'They are unique', 'They are equal', 'They are prime'], correct: 1 },
      { question: 'If a = 100 and b = 7, what is r?', options: ['1', '2', '3', '14'], correct: 1 },
      { question: 'Who formalized modular arithmetic using the Division Algorithm?', options: ['Euclid', 'Carl Friedrich Gauss', 'Leonhard Euler', 'Pierre de Fermat'], correct: 1 },
      { question: 'When the remainder r = 0, what does it mean?', options: ['a is prime', 'b divides a evenly', 'a equals b', 'q equals 0'], correct: 1 },
      { question: 'What is the remainder when 256 is divided by 17?', options: ['1', '15', '16', '0'], correct: 0 },
    ]
  },
  {
    id: 'palindrome',
    title: 'Mission Palindrome',
    subtitle: 'The Symmetry Directive',
    description: 'Explore palindromes — words and phrases that read the same forwards and backwards, and their deep connection to Pushdown Automata.',
    icon: 'P',
    color: 'amber',
    overview: `A palindrome is a string that reads the same forwards and backwards — a perfect mirror of characters. From "racecar" to "A man a plan a canal Panama," palindromes have fascinated linguists, mathematicians, and computer scientists for centuries.\n\nIn formal language theory, palindromes hold a special place. The language of palindromes over an alphabet is a classic example of a language that can be recognized by a Pushdown Automaton (PDA) but NOT by any Finite Automaton (FA). This is because checking whether a string is a palindrome requires comparing the first half of the string with the reverse of the second half — a task that demands unbounded memory to store the first half for later comparison.\n\nA Pushdown Automaton solves this by using a stack: it pushes symbols from the first half of the input onto the stack, then non-deterministically guesses the midpoint and pops symbols to compare with the second half. If every popped symbol matches the corresponding input symbol, the string is accepted. This demonstrates the greater expressive power of PDAs over FAs — they can handle context-free languages that are beyond the reach of regular languages.\n\nThe palindrome language is context-free but not regular, making it a fundamental example in the Chomsky hierarchy of formal languages.`,
    formula: 'w = w^R',
    formulaDescription: 'A string w is a palindrome if and only if it equals its reverse w^R. This seemingly simple condition defines a language that is context-free but not regular — it requires a Pushdown Automaton (PDA) for recognition, as the stack provides the unbounded memory needed to compare the first and second halves of the string.',
    workedExample: {
      title: 'Checking if "racecar" is a palindrome',
      steps: [
        'Input: "racecar" (7 characters)',
        'Normalize: "racecar" (already lowercase, no spaces)',
        'Compare positions from outside in:',
        'Position 1 vs 7: r vs r ✔',
        'Position 2 vs 6: a vs a ✔',
        'Position 3 vs 5: c vs c ✔',
        'Position 4 (middle): e — single center character, no pair needed ✔',
        'All character pairs match → "racecar" IS a palindrome!',
        'PDA perspective: Push r,a,c,e onto stack; guess midpoint; pop e (skip center), pop c vs c ✔, pop a vs a ✔, pop r vs r ✔ → Accept'
      ]
    },
    simulatorLabel: 'Word, Phrase, or Number',
    simulatorPlaceholder: 'Enter a word, phrase, or number (e.g., racecar, 12321, A man a plan a canal Panama)',
    applications: [
      'DNA sequence analysis — palindromic sequences play a crucial role in gene regulation and restriction enzyme recognition sites',
      'Error detection in data transmission — palindromic parity checks and cyclic redundancy codes',
      'Cryptography — palindromic structures appear in certain encryption algorithms and hash functions',
      'Natural language processing — identifying symmetric linguistic patterns and stylistic analysis',
      'Compiler design — context-free grammar parsing uses stack-based mechanisms similar to PDA palindrome recognition'
    ],
    history: 'Palindromes have a rich history spanning millennia. The earliest known palindrome is the Sator Square, a Latin word square found in Pompeii (before 79 AD), which reads the same forwards, backwards, top-to-bottom, and bottom-to-top: SATOR AREPO TENET OPERA ROTAS. In English, palindromes appeared as early as the 17th century. The formal study of palindrome languages in computer science began with the development of automata theory in the 1950s and 1960s. Noam Chomsky\'s hierarchy of formal languages classified palindrome languages as context-free, and the proof that palindromes cannot be recognized by finite automata (using the pumping lemma for regular languages) became a standard result in theoretical computer science. The connection to Pushdown Automata was established as part of the foundational work on context-free languages by Chomsky and Schützenberger.',
    quiz: [
      { question: 'What is a palindrome?', options: ['A string that reads the same forwards and backwards', 'A string with all identical characters', 'A string sorted in alphabetical order', 'A string with an even number of characters'], correct: 0 },
      { question: 'Which of the following is a palindrome?', options: ['"hello"', '"racecar"', '"python"', '"algorithm"'], correct: 1 },
      { question: 'What type of automaton can recognize the language of palindromes?', options: ['Finite Automaton (FA)', 'Pushdown Automaton (PDA)', 'Turing Machine only', 'Linear Bounded Automaton'], correct: 1 },
      { question: 'Why can\'t a Finite Automaton recognize all palindromes?', options: ['It runs too slowly', 'It cannot store unbounded memory to compare the first and second halves', 'It can only process even-length strings', 'It requires a special alphabet'], correct: 1 },
      { question: 'In a PDA that recognizes palindromes, what is the purpose of the stack?', options: ['To count the total number of characters', 'To store the first half of the input for comparison with the second half', 'To reverse the entire input string', 'To track the current state of the automaton'], correct: 1 },
      { question: 'Is "A man a plan a canal Panama" a palindrome when spaces are removed?', options: ['Yes', 'No', 'Only with capitalization preserved', 'It depends on the alphabet'], correct: 0 },
      { question: 'What is the palindrome language over {a, b} formally?', options: ['{w | w = w^R, w ∈ {a,b}*}', '{w | w has equal a\'s and b\'s}', '{w | w = ww}', '{a^n b^n | n ≥ 0}'], correct: 0 },
    ]
  }
];
