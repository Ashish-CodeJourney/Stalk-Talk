import { useMemo } from "react";
import type { Message } from "@stalk-talk/types";

const OPTIMISTIC_PREFIX = "__opt__";

export const useCombinedMessages = (history: Message[], realtime: Message[]): Message[] =>
  useMemo(() => {
    const confirmedIds = new Set(history.map((m) => m.id));
    const realtimeFiltered = realtime.filter((m) => {
      if (confirmedIds.has(m.id)) return false;
      if (m.id.startsWith(OPTIMISTIC_PREFIX)) {
        return !history.some((h) => h.userId === m.userId && h.text === m.text);
      }
      return true;
    });
    return [...history, ...realtimeFiltered];
  }, [history, realtime]);
