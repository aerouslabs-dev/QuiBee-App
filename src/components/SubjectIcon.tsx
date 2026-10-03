import { Atom, BookOpen, Calculator, Dna, FlaskConical, Globe, Landmark, type LucideProps } from 'lucide-react'
import type { Subject } from '@/data/fixtures'

const ICONS = { Calculator, Atom, FlaskConical, Dna, Landmark, BookOpen, Globe }

export function SubjectIcon({ icon, ...props }: { icon: Subject['icon'] } & LucideProps) {
  const Icon = ICONS[icon]
  return <Icon {...props} />
}
