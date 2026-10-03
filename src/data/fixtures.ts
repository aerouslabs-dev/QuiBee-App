/**
 * QuiBee fixture data.
 *
 * Everything the UI reads (subjects, question bank, players, events) is
 * defined here so a later milestone can swap this module for real
 * persistence (Netlify Database) without touching the screens.
 */

export type SubjectId =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'religion'
  | 'gk'

export interface Subject {
  id: SubjectId
  name: string
  tagline: string
  icon: 'Calculator' | 'Atom' | 'FlaskConical' | 'Dna' | 'Landmark' | 'BookOpen' | 'Globe'
  /** Tailwind-friendly hex colors for the subject card gradient */
  from: string
  to: string
}

export interface Question {
  id: string
  prompt: string
  options: [string, string, string, string]
  /** index into options */
  answer: number
  /** 1 = easy, 2 = medium, 3 = hard */
  difficulty: 1 | 2 | 3
}

export interface Player {
  id: string
  name: string
  handle: string
  avatar: string
  level: number
  points: number
  wins: number
  losses: number
  country: string
  title: string
  followers: number
  favoriteSubject: SubjectId
}

export interface HiveEvent {
  id: 'googly' | 'timefast'
  name: string
  description: string
  rules: string[]
  durationSec: number
  rewardMultiplier: number
  endsInHours: number
}

export const TOTAL_LEVELS = 100
export const QUESTIONS_PER_LEVEL = 10
export const QUESTION_TIME_SEC = 15

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathematics', tagline: 'Numbers, patterns & proofs', icon: 'Calculator', from: '#F5A623', to: '#F07B1E' },
  { id: 'physics', name: 'Physics', tagline: 'Forces, energy & the cosmos', icon: 'Atom', from: '#2B8CBE', to: '#5B6CE0' },
  { id: 'chemistry', name: 'Chemistry', tagline: 'Elements, bonds & reactions', icon: 'FlaskConical', from: '#14B8A6', to: '#2B8CBE' },
  { id: 'biology', name: 'Biology', tagline: 'Cells, life & evolution', icon: 'Dna', from: '#22C55E', to: '#14B8A6' },
  { id: 'history', name: 'History', tagline: 'Empires, eras & turning points', icon: 'Landmark', from: '#B45309', to: '#F5A623' },
  { id: 'religion', name: 'Religion', tagline: 'Faiths, texts & traditions', icon: 'BookOpen', from: '#8B5CF6', to: '#EC4899' },
  { id: 'gk', name: 'General Knowledge', tagline: 'A bit of everything', icon: 'Globe', from: '#EF4444', to: '#F5A623' },
]

export function getSubject(id: SubjectId): Subject {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0]
}

type Raw = [prompt: string, options: [string, string, string, string], answer: number, difficulty: 1 | 2 | 3]

const BANK: Record<Exclude<SubjectId, 'math'>, Raw[]> = {
  physics: [
    ['What is the SI unit of force?', ['Joule', 'Newton', 'Watt', 'Pascal'], 1, 1],
    ['Which planet has the strongest surface gravity?', ['Earth', 'Saturn', 'Jupiter', 'Neptune'], 2, 1],
    ['Speed of light in vacuum is about…', ['3×10⁵ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁶ m/s'], 1, 1],
    ['What does a voltmeter measure?', ['Current', 'Resistance', 'Potential difference', 'Power'], 2, 1],
    ['Sound cannot travel through…', ['Water', 'Steel', 'Vacuum', 'Air'], 2, 1],
    ['Unit of electrical resistance?', ['Ohm', 'Volt', 'Ampere', 'Tesla'], 0, 1],
    ['Newton’s second law is…', ['F = ma', 'E = mc²', 'V = IR', 'P = IV'], 0, 2],
    ['Which particle has no electric charge?', ['Proton', 'Electron', 'Neutron', 'Positron'], 2, 2],
    ['Kinetic energy formula?', ['mgh', '½mv²', 'mv', 'Fd'], 1, 2],
    ['Lens used to correct myopia?', ['Convex', 'Concave', 'Cylindrical', 'Bifocal'], 1, 2],
    ['Absolute zero in Celsius is…', ['−100 °C', '−273.15 °C', '0 °C', '−459.67 °C'], 1, 2],
    ['Planck’s constant is approximately…', ['6.63×10⁻³⁴ J·s', '1.6×10⁻¹⁹ J·s', '9.81 J·s', '3×10⁻⁸ J·s'], 0, 3],
    ['Which force binds quarks together?', ['Electromagnetic', 'Weak nuclear', 'Strong nuclear', 'Gravity'], 2, 3],
    ['Escape velocity from Earth is about…', ['7.9 km/s', '11.2 km/s', '15.4 km/s', '3.1 km/s'], 1, 3],
    ['Heisenberg’s principle relates position and…', ['Energy', 'Momentum', 'Spin', 'Mass'], 1, 3],
  ],
  chemistry: [
    ['Chemical symbol for gold?', ['Go', 'Gd', 'Au', 'Ag'], 2, 1],
    ['pH of pure water at 25 °C?', ['0', '7', '14', '1'], 1, 1],
    ['H₂O is commonly known as…', ['Salt', 'Water', 'Hydrogen peroxide', 'Ammonia'], 1, 1],
    ['Most abundant gas in Earth’s air?', ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Argon'], 2, 1],
    ['Atomic number of carbon?', ['6', '8', '12', '14'], 0, 1],
    ['NaCl is…', ['Baking soda', 'Table salt', 'Bleach', 'Chalk'], 1, 1],
    ['Which is a noble gas?', ['Chlorine', 'Neon', 'Nitrogen', 'Hydrogen'], 1, 2],
    ['Avogadro’s number is about…', ['6.02×10²³', '3.14×10²³', '9.81×10²³', '1.6×10¹⁹'], 0, 2],
    ['Bond formed by sharing electrons?', ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], 1, 2],
    ['Lightest element?', ['Helium', 'Lithium', 'Hydrogen', 'Carbon'], 2, 2],
    ['Rusting of iron is an example of…', ['Reduction', 'Oxidation', 'Sublimation', 'Neutralisation'], 1, 2],
    ['Hybridisation of carbon in methane?', ['sp', 'sp²', 'sp³', 'dsp²'], 2, 3],
    ['Which element has the highest electronegativity?', ['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'], 2, 3],
    ['Benzene’s molecular formula?', ['C₆H₆', 'C₆H₁₂', 'C₅H₁₀', 'C₆H₁₄'], 0, 3],
    ['Le Chatelier’s principle concerns…', ['Reaction rates', 'Equilibrium shifts', 'Atomic radii', 'Gas diffusion'], 1, 3],
  ],
  biology: [
    ['Powerhouse of the cell?', ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], 2, 1],
    ['How many chambers does a human heart have?', ['2', '3', '4', '5'], 2, 1],
    ['Plants make food by…', ['Respiration', 'Photosynthesis', 'Digestion', 'Transpiration'], 1, 1],
    ['Largest organ of the human body?', ['Liver', 'Brain', 'Skin', 'Lungs'], 2, 1],
    ['Red blood cells carry…', ['Oxygen', 'Hormones', 'Antibodies', 'Enzymes'], 0, 1],
    ['DNA stands for…', ['Deoxyribonucleic acid', 'Dinitro acid', 'Dual nucleic acid', 'Deoxy amino acid'], 0, 1],
    ['Which blood group is the universal donor?', ['A+', 'AB+', 'O−', 'B−'], 2, 2],
    ['Insulin is produced by the…', ['Liver', 'Pancreas', 'Kidney', 'Thyroid'], 1, 2],
    ['Basic unit of heredity?', ['Cell', 'Gene', 'Tissue', 'Protein'], 1, 2],
    ['Number of bones in an adult human?', ['186', '206', '226', '256'], 1, 2],
    ['Who proposed natural selection?', ['Mendel', 'Darwin', 'Pasteur', 'Lamarck'], 1, 2],
    ['Site of protein synthesis?', ['Lysosome', 'Ribosome', 'Vacuole', 'Centriole'], 1, 3],
    ['Which base is found in RNA but not DNA?', ['Thymine', 'Adenine', 'Uracil', 'Guanine'], 2, 3],
    ['Krebs cycle occurs in the…', ['Cytoplasm', 'Mitochondrial matrix', 'Nucleus', 'Chloroplast'], 1, 3],
    ['Meiosis produces how many daughter cells?', ['2', '4', '8', '1'], 1, 3],
  ],
  history: [
    ['Who was the first President of the USA?', ['Lincoln', 'Jefferson', 'Washington', 'Adams'], 2, 1],
    ['The Great Pyramid is in which country?', ['Mexico', 'Egypt', 'Peru', 'Iraq'], 1, 1],
    ['World War II ended in…', ['1918', '1939', '1945', '1950'], 2, 1],
    ['Who discovered the sea route to India in 1498?', ['Columbus', 'Vasco da Gama', 'Magellan', 'Cook'], 1, 1],
    ['The Berlin Wall fell in…', ['1985', '1989', '1991', '1979'], 1, 1],
    ['Ancient city destroyed by Mount Vesuvius?', ['Athens', 'Pompeii', 'Carthage', 'Troy'], 1, 1],
    ['The Magna Carta was signed in…', ['1066', '1215', '1492', '1603'], 1, 2],
    ['First man to walk on the Moon?', ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'John Glenn'], 2, 2],
    ['The French Revolution began in…', ['1776', '1789', '1804', '1815'], 1, 2],
    ['Founder of the Mughal Empire?', ['Akbar', 'Babur', 'Humayun', 'Aurangzeb'], 1, 2],
    ['The Renaissance began in…', ['France', 'England', 'Italy', 'Spain'], 2, 2],
    ['Treaty that ended World War I?', ['Treaty of Paris', 'Treaty of Versailles', 'Treaty of Ghent', 'Treaty of Rome'], 1, 3],
    ['Byzantine capital Constantinople fell in…', ['1204', '1453', '1517', '1389'], 1, 3],
    ['Who unified Germany in 1871?', ['Bismarck', 'Kaiser Wilhelm II', 'Metternich', 'Frederick the Great'], 0, 3],
    ['The Meiji Restoration took place in…', ['China', 'Korea', 'Japan', 'Vietnam'], 2, 3],
  ],
  religion: [
    ['Holy book of Islam?', ['Torah', 'Quran', 'Vedas', 'Tripitaka'], 1, 1],
    ['Christmas celebrates the birth of…', ['Moses', 'Jesus', 'Abraham', 'Paul'], 1, 1],
    ['Diwali is primarily a festival of…', ['Colours', 'Lights', 'Harvest', 'Kites'], 1, 1],
    ['Founder of Buddhism?', ['Mahavira', 'Siddhartha Gautama', 'Confucius', 'Laozi'], 1, 1],
    ['Sikhism’s holiest shrine?', ['Golden Temple', 'Lotus Temple', 'Jama Masjid', 'Akshardham'], 0, 1],
    ['Holy city for Islam, Christianity & Judaism?', ['Mecca', 'Rome', 'Jerusalem', 'Varanasi'], 2, 1],
    ['Number of pillars of Islam?', ['3', '5', '7', '10'], 1, 2],
    ['Torah is central to which religion?', ['Judaism', 'Zoroastrianism', 'Jainism', 'Shinto'], 0, 2],
    ['Guru Nanak founded…', ['Jainism', 'Sikhism', 'Bahá’í', 'Taoism'], 1, 2],
    ['The Bhagavad Gita is part of the…', ['Ramayana', 'Mahabharata', 'Upanishads', 'Puranas'], 1, 2],
    ['Ramadan is the ___ month of the Islamic calendar.', ['1st', '7th', '9th', '12th'], 2, 2],
    ['Zoroastrians worship in a…', ['Fire temple', 'Pagoda', 'Gurdwara', 'Synagogue'], 0, 3],
    ['The Tao Te Ching is attributed to…', ['Confucius', 'Laozi', 'Mencius', 'Zhuangzi'], 1, 3],
    ['24th Tirthankara of Jainism?', ['Rishabhanatha', 'Parshvanatha', 'Mahavira', 'Neminatha'], 2, 3],
    ['Shinto is native to…', ['China', 'Korea', 'Japan', 'Thailand'], 2, 3],
  ],
  gk: [
    ['Largest ocean on Earth?', ['Atlantic', 'Indian', 'Pacific', 'Arctic'], 2, 1],
    ['How many continents are there?', ['5', '6', '7', '8'], 2, 1],
    ['Capital of Japan?', ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'], 2, 1],
    ['Which is the fastest land animal?', ['Lion', 'Cheetah', 'Horse', 'Leopard'], 1, 1],
    ['How many days in a leap year?', ['364', '365', '366', '367'], 2, 1],
    ['Which colour do you get mixing blue & yellow?', ['Purple', 'Green', 'Orange', 'Brown'], 1, 1],
    ['Tallest mountain in the world?', ['K2', 'Kangchenjunga', 'Mount Everest', 'Lhotse'], 2, 2],
    ['Currency of the United Kingdom?', ['Euro', 'Pound sterling', 'Dollar', 'Franc'], 1, 2],
    ['Who painted the Mona Lisa?', ['Van Gogh', 'Picasso', 'Da Vinci', 'Michelangelo'], 2, 2],
    ['Longest river in the world?', ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], 1, 2],
    ['Smallest country by area?', ['Monaco', 'Vatican City', 'San Marino', 'Malta'], 1, 2],
    ['Which country has the most time zones?', ['Russia', 'USA', 'France', 'China'], 2, 3],
    ['Deepest point in the ocean?', ['Tonga Trench', 'Mariana Trench', 'Java Trench', 'Puerto Rico Trench'], 1, 3],
    ['Who wrote “One Hundred Years of Solitude”?', ['Borges', 'García Márquez', 'Neruda', 'Allende'], 1, 3],
    ['Hardest natural substance?', ['Quartz', 'Diamond', 'Topaz', 'Corundum'], 1, 3],
  ],
}

/** Tiny deterministic PRNG so a given level always serves the same set. */
export function seeded(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleOptions(q: Question, rand: () => number): Question {
  const order = shuffle([0, 1, 2, 3], rand)
  return {
    ...q,
    options: order.map((i) => q.options[i]) as Question['options'],
    answer: order.indexOf(q.answer),
  }
}

/** Difficulty target rises from 1 → 3 across the 100 levels. */
export function difficultyFor(level: number): number {
  return 1 + ((Math.min(Math.max(level, 1), TOTAL_LEVELS) - 1) / (TOTAL_LEVELS - 1)) * 2
}

/** Point multiplier scales with level: L1 = ×1.0, L100 = ×5.95 */
export function multiplierFor(level: number): number {
  return Math.round((1 + (level - 1) * 0.05) * 100) / 100
}

function mathQuestion(level: number, i: number, rand: () => number): Question {
  const span = 5 + level * 3
  const a = 2 + Math.floor(rand() * span)
  const b = 2 + Math.floor(rand() * span)
  const ops = level < 20 ? ['+', '−'] : level < 50 ? ['+', '−', '×'] : ['+', '−', '×', '²']
  const op = ops[Math.floor(rand() * ops.length)]
  let prompt: string
  let answer: number
  switch (op) {
    case '−':
      prompt = `${Math.max(a, b)} − ${Math.min(a, b)} = ?`
      answer = Math.max(a, b) - Math.min(a, b)
      break
    case '×': {
      const x = 2 + Math.floor(rand() * Math.min(12 + level / 4, 30))
      const y = 2 + Math.floor(rand() * 12)
      prompt = `${x} × ${y} = ?`
      answer = x * y
      break
    }
    case '²': {
      const x = 4 + Math.floor(rand() * Math.min(level / 2, 40))
      prompt = `${x}² = ?`
      answer = x * x
      break
    }
    default:
      prompt = `${a} + ${b} = ?`
      answer = a + b
  }
  const wrong = new Set<number>()
  while (wrong.size < 3) {
    const delta = (1 + Math.floor(rand() * Math.max(3, answer * 0.15))) * (rand() > 0.5 ? 1 : -1)
    const w = answer + delta
    if (w !== answer && w >= 0) wrong.add(w)
  }
  const opts = shuffle([answer, ...wrong], rand)
  return {
    id: `math-${level}-${i}`,
    prompt,
    options: opts.map(String) as Question['options'],
    answer: opts.indexOf(answer),
    difficulty: level < 34 ? 1 : level < 67 ? 2 : 3,
  }
}

/** Build the 10-question set for a subject + level (deterministic). */
export function getLevelQuestions(subjectId: SubjectId, level: number, count = QUESTIONS_PER_LEVEL): Question[] {
  const rand = seeded(level * 7919 + subjectId.length * 104729 + subjectId.charCodeAt(0))
  if (subjectId === 'math') {
    return Array.from({ length: count }, (_, i) => mathQuestion(level, i, rand))
  }
  const target = difficultyFor(level)
  const pool: Question[] = BANK[subjectId].map(([prompt, options, answer, difficulty], i) => ({
    id: `${subjectId}-${i}`,
    prompt,
    options,
    answer,
    difficulty,
  }))
  const picked = shuffle(pool, rand)
    .sort((x, y) => Math.abs(x.difficulty - target) - Math.abs(y.difficulty - target))
    .slice(0, count)
  return shuffle(picked, rand).map((q) => shuffleOptions(q, rand))
}

/** A random set from one subject across many levels — used by subject-specific custom events. */
export function getSubjectQuestions(subjectId: SubjectId, count: number, seed = Date.now()): Question[] {
  const rand = seeded(seed)
  return Array.from({ length: count }, (_, i) => {
    const set = getLevelQuestions(subjectId, 1 + Math.floor(rand() * 60), 10)
    const q = set[Math.floor(rand() * set.length)]
    return { ...q, id: `${q.id}-sub-${i}` }
  })
}

/** A random mixed set across all subjects — used by events and battles. */
export function getMixedQuestions(count: number, seed = Date.now()): Question[] {
  const rand = seeded(seed)
  const out: Question[] = []
  for (let i = 0; i < count; i++) {
    const subject = SUBJECTS[Math.floor(rand() * SUBJECTS.length)].id
    const level = 1 + Math.floor(rand() * 60)
    const set = getLevelQuestions(subject, level, 10)
    const q = set[Math.floor(rand() * set.length)]
    out.push({ ...q, id: `${q.id}-mix-${i}` })
  }
  return out
}

export const PLAYERS: Player[] = [
  { id: 'p1', name: 'Zara Malik', handle: 'zarabuzz', avatar: '🦊', level: 87, points: 184_220, wins: 412, losses: 96, country: '🇵🇰', title: 'Queen of the Hive', followers: 12_400, favoriteSubject: 'physics' },
  { id: 'p2', name: 'Kenji Mori', handle: 'kenjimind', avatar: '🐉', level: 81, points: 171_905, wins: 377, losses: 120, country: '🇯🇵', title: 'Grand Strategist', followers: 9_870, favoriteSubject: 'math' },
  { id: 'p3', name: 'Amara Okafor', handle: 'amaraq', avatar: '🦁', level: 78, points: 166_310, wins: 350, losses: 131, country: '🇳🇬', title: 'Lioness Scholar', followers: 8_215, favoriteSubject: 'biology' },
  { id: 'p4', name: 'Lucas Ferreira', handle: 'lucasf', avatar: '🐯', level: 72, points: 149_480, wins: 301, losses: 140, country: '🇧🇷', title: 'Speed Demon', followers: 5_640, favoriteSubject: 'gk' },
  { id: 'p5', name: 'Aisha Rahman', handle: 'aishar', avatar: '🦉', level: 70, points: 142_015, wins: 288, losses: 152, country: '🇧🇩', title: 'Night Owl', followers: 4_980, favoriteSubject: 'history' },
  { id: 'p6', name: 'Noah Schmidt', handle: 'noahs', avatar: '🐺', level: 66, points: 133_600, wins: 260, losses: 160, country: '🇩🇪', title: 'Lone Wolf', followers: 3_310, favoriteSubject: 'chemistry' },
  { id: 'p7', name: 'Priya Nair', handle: 'priyan', avatar: '🦋', level: 63, points: 127_250, wins: 240, losses: 149, country: '🇮🇳', title: 'Butterfly Effect', followers: 3_120, favoriteSubject: 'religion' },
  { id: 'p8', name: 'Omar Haddad', handle: 'omarh', avatar: '🐼', level: 59, points: 118_400, wins: 221, losses: 170, country: '🇯🇴', title: 'Calm Genius', followers: 2_640, favoriteSubject: 'history' },
  { id: 'p9', name: 'Chloe Martin', handle: 'chloem', avatar: '🦄', level: 55, points: 109_770, wins: 198, losses: 166, country: '🇫🇷', title: 'Rare Find', followers: 2_210, favoriteSubject: 'gk' },
  { id: 'p10', name: 'Diego Ruiz', handle: 'diegor', avatar: '🐸', level: 51, points: 98_320, wins: 180, losses: 175, country: '🇲🇽', title: 'Leap Thinker', followers: 1_780, favoriteSubject: 'physics' },
  { id: 'p11', name: 'Sofia Rossi', handle: 'sofiar', avatar: '🐨', level: 47, points: 90_115, wins: 162, losses: 170, country: '🇮🇹', title: 'Steady Climber', followers: 1_350, favoriteSubject: 'biology' },
  { id: 'p12', name: 'Ethan Clarke', handle: 'ethanc', avatar: '🐙', level: 44, points: 84_900, wins: 150, losses: 168, country: '🇬🇧', title: 'Multi-tasker', followers: 1_120, favoriteSubject: 'chemistry' },
  { id: 'p13', name: 'Fatima Zahra', handle: 'fatimaz', avatar: '🐧', level: 40, points: 76_400, wins: 133, losses: 150, country: '🇲🇦', title: 'Cool Head', followers: 980, favoriteSubject: 'religion' },
  { id: 'p14', name: 'Liam O’Brien', handle: 'liamob', avatar: '🐵', level: 36, points: 68_050, wins: 120, losses: 141, country: '🇮🇪', title: 'Cheeky Chimp', followers: 760, favoriteSubject: 'math' },
  { id: 'p15', name: 'Mei Lin', handle: 'meilin', avatar: '🐲', level: 33, points: 61_200, wins: 104, losses: 128, country: '🇨🇳', title: 'Rising Dragon', followers: 640, favoriteSubject: 'math' },
]

export function getPlayer(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id)
}

export const EVENTS: HiveEvent[] = [
  {
    id: 'timefast',
    name: 'Time Fast Quiz',
    description: 'One global 60-second clock. Answer as many as you can — every correct answer counts.',
    rules: ['60 seconds total, no per-question timer', 'Wrong answers cost no time, but no points', 'Lifelines are disabled'],
    durationSec: 60,
    rewardMultiplier: 2,
    endsInHours: 31,
  },
  {
    id: 'googly',
    name: 'Googly Quiz',
    description: 'Trick-shot questions from every subject, shuffled at random. Expect the unexpected.',
    rules: ['10 mixed-subject curveballs', '10 seconds per question', 'Double points for every correct answer'],
    durationSec: 10,
    rewardMultiplier: 2,
    endsInHours: 54,
  },
]

export const AVATARS = ['🐝', '🦊', '🐼', '🦁', '🐯', '🐸', '🦉', '🐨', '🐙', '🦄', '🐲', '🐺', '🐵', '🐧', '🦋']

export const DEVELOPER = { name: 'aerous labs', url: 'https://www.aerouslabs.netlify.com' }
