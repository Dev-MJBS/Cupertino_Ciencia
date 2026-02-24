'use server'

import { adminDb } from '@/lib/firebase/server'
import { getSession } from '@/app/auth/actions'
import { revalidatePath } from 'next/cache'

export async function updateTask(taskId: string, topicId: string, formData: FormData) {
  const user = await getSession()
  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  await adminDb.collection('topics').doc(topicId).collection('tasks').doc(taskId).update({
    title,
    content
  })

  revalidatePath(`/topic/${topicId}/task/${taskId}`)
  revalidatePath(`/topic/${topicId}`)
}

