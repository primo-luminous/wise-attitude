'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { showLoginSuccess } from '@/lib/sweetalert'

function AlertOnLoginContent(): null {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      const user = searchParams.get('user')
      if (user) {
        showLoginSuccess(decodeURIComponent(user))
      } else {
        showLoginSuccess('ผู้ใช้')
      }
      
      // Clean the query so the alert doesn't show again on navigation/back
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.delete('login')
      params.delete('user')
      const url = params.toString() ? `/?${params.toString()}` : '/'
      router.replace(url)
    }
  }, [searchParams, router])

  return null
}

export default function AlertOnLogin() {
  return (
    <Suspense fallback={null}>
      <AlertOnLoginContent />
    </Suspense>
  )
}


