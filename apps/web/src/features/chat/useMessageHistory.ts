import { useInfiniteQuery } from "@tanstack/react-query";
import type { Message } from "@stalk-talk/types";
import { fetchMessages } from "./message.api.js";

type MessagePage = { data: Message[]; nextCursor: string | undefined };

export const useMessageHistory = (roomId: string, token: string | null) => {
  const query = useInfiniteQuery<MessagePage, Error, MessagePage[], string[], string | undefined>({
    queryKey: ["messages", roomId],
    queryFn: ({ pageParam }) => fetchMessages(token!, roomId, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: token !== null,
    select: (d) => d.pages,
  });

  const messages = query.data?.flatMap((page) => page.data) ?? [];

  return {
    messages,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetching: query.isFetching,
  };
};
