'use server'

import { adminDb } from '@/lib/firebase/server'
import { getSession } from '@/app/auth/actions'
import { revalidatePath } from 'next/cache'

export async function updateStructure(topicId: string, formData: FormData) {
  const user = await getSession()
  if (!user) throw new Error('Not authenticated')
  
  const structure = {
    problema: formData.get('problema') as string,
    delimitacao: formData.get('delimitacao') as string,
    justificativa: formData.get('justificativa') as string,
    objetivo: formData.get('objetivo') as string,
    tese: formData.get('tese') as string,
    conclusao_provisoria: formData.get('conclusao_provisoria') as string,
    updatedAt: new Date().toISOString()
  }

  await adminDb.collection('topics').doc(topicId).update({
    structure
  })

  revalidatePath(`/topic/${topicId}`)
}

export async function createTask(topicId: string, formData: FormData) {
  const user = await getSession()
  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string

  const docRef = await adminDb.collection('topics').doc(topicId).collection('tasks').add({
    title,
    content: '',
    createdAt: new Date().toISOString()
  })

  revalidatePath(`/topic/${topicId}`)
}

export async function deleteTask(taskId: string, topicId: string) {
  const user = await getSession()
  if (!user) throw new Error('Not authenticated')

  await adminDb.collection('topics').doc(topicId).collection('tasks').doc(taskId).delete()
  revalidatePath(`/topic/${topicId}`)
}

