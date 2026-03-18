import { useQueryClient } from "@tanstack/react-query";
import { 
  useUploadBook, 
  useDeleteBook, 
  getListBooksQueryKey,
  useSearchFragments,
  useAnswerQuestion,
  useListBooks
} from "@workspace/api-client-react";

export function useAppListBooks() {
  return useListBooks({
    query: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  });
}

export function useAppUploadBook() {
  const queryClient = useQueryClient();
  return useUploadBook({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
      }
    }
  });
}

export function useAppDeleteBook() {
  const queryClient = useQueryClient();
  return useDeleteBook({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
      }
    }
  });
}

// Re-exporting these directly as they don't strictly need cache invalidation rules
// for their own operation, but it's good to have them centralized.
export { useSearchFragments, useAnswerQuestion };
