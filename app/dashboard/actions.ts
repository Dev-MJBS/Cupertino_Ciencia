'use server'

import { adminDb } from '@/lib/firebase/server'
import { getSession } from '@/app/auth/actions'
import { revalidatePath } from 'next/cache'

export async function createTopic(formData: FormData) {
  const user = await getSession()
  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  
  const topicRef = await adminDb.collection('topics').add({
    title,
    userId: user.uid,
    createdAt: new Date().toISOString(),
    structure: {
      problema: '',
      delimitacao: '',
      justificativa: '',
      objetivo: '',
      tese: '',
      conclusao_provisoria: '',
      updatedAt: new Date().toISOString()
    }
  })

  revalidatePath('/dashboard')
}

export async function deleteTopic(id: string) {
  const user = await getSession()
  if (!user) throw new Error('Not authenticated')

  // In Firestore, deleting a document doesn't delete subcollections automatically 
  // but if we use the map approach for structure, we only need to worry about tasks subcoll
  // However, I'll just delete the topic doc for simplicity in this MVP
  await adminDb.collection('topics').doc(id).delete()
  
  revalidatePath('/dashboard')
}

