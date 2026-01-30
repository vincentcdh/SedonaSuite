// ===========================================
// CLIENT QUESTIONS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClientQuestions,
  getClientQuestionById,
  answerClientQuestion,
  closeClientQuestion,
  reopenClientQuestion,
  getOpenQuestionsCount,
} from '../server'
import type { AnswerClientQuestionInput } from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const clientQuestionsKeys = {
  all: ['client-questions'] as const,
  lists: () => [...clientQuestionsKeys.all, 'list'] as const,
  list: (projectId: string) => [...clientQuestionsKeys.lists(), projectId] as const,
  details: () => [...clientQuestionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientQuestionsKeys.details(), id] as const,
  count: (projectId: string) => [...clientQuestionsKeys.all, 'count', projectId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useClientQuestions(projectId: string) {
  return useQuery({
    queryKey: clientQuestionsKeys.list(projectId),
    queryFn: () => getClientQuestions(projectId),
    enabled: !!projectId,
  })
}

export function useClientQuestionById(id: string) {
  return useQuery({
    queryKey: clientQuestionsKeys.detail(id),
    queryFn: () => getClientQuestionById(id),
    enabled: !!id,
  })
}

export function useOpenQuestionsCount(projectId: string) {
  return useQuery({
    queryKey: clientQuestionsKeys.count(projectId),
    queryFn: () => getOpenQuestionsCount(projectId),
    enabled: !!projectId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useAnswerClientQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AnswerClientQuestionInput) => answerClientQuestion(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: clientQuestionsKeys.list(data.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: clientQuestionsKeys.detail(data.id),
      })
      queryClient.invalidateQueries({
        queryKey: clientQuestionsKeys.count(data.projectId),
      })
    },
  })
}

export function useCloseClientQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      closeClientQuestion(id).then((data) => ({ ...data, projectId })),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: clientQuestionsKeys.list(data.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: clientQuestionsKeys.count(data.projectId),
      })
    },
  })
}

export function useReopenClientQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      reopenClientQuestion(id).then((data) => ({ ...data, projectId })),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: clientQuestionsKeys.list(data.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: clientQuestionsKeys.count(data.projectId),
      })
    },
  })
}
