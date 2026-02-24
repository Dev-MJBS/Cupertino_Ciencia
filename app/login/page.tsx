'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { clientAuth } from '@/lib/firebase/client'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { createSession } from '@/app/auth/actions'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(clientAuth, provider)
      const idToken = await userCredential.user.getIdToken()
      await createSession(idToken)
    } catch (error: any) {
      setErrorMsg(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen bg-[#0a0a0a] text-white">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-gray-400 bg-white/5 hover:bg-white/10 flex items-center group text-sm transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}
        Voltar
      </Link>

      <div className="animate-in flex-1 flex flex-col w-full justify-center gap-6 pr-0">
        <div className="text-center">
          <h1 className="text-5xl font-black mb-2 tracking-tighter text-blue-500">Ciência Pedagogia</h1>
          <p className="text-gray-500 font-medium">Plataforma de Escrita Acadêmica Autoral</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">Acesse sua Conta</h2>
            <p className="text-sm text-gray-400">Utilize sua conta institucional ou pessoal do Google para continuar.</p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-4 bg-white text-black rounded-2xl px-4 py-4 font-black hover:bg-gray-200 transition active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-white/5"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google icon" />
            Entrar com Google
          </button>

          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center font-medium">
              {errorMsg}
            </div>
          )}

          {message && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm rounded-xl text-center font-medium">
              {message}
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          © 2024 CIÊNCIA PEDAGOGIA • RIGOR ACADÊMICO
        </p>
      </div>
    </div>
  )
}

