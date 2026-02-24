'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth } from '@/lib/firebase/server'

export async function createSession(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

  cookies().set('session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  redirect('/dashboard')
}

export async function signOut() {
  cookies().delete('session')
  redirect('/login')
}

export async function getSession() {
  const session = cookies().get('session')?.value
  if (!session) return null

  try {
    const decodedToken = await adminAuth.verifySessionCookie(session, true)
    return decodedToken
  } catch (error) {
    return null
  }
}

