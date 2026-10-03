import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'
import { AppProvider } from '@/lib/store'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
