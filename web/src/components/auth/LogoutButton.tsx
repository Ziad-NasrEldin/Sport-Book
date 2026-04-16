'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api, clearTokens } from '@/lib/api/client'

type LogoutButtonProps = {
  className?: string
  label?: string
}

export function LogoutButton({ className, label = 'Log Out' }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // best-effort
    }
    clearTokens()
    router.push('/auth/sign-in')
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
      aria-label="Log out"
    >
      <LogOut className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}
