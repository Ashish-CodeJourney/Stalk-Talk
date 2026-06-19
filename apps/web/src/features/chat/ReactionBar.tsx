import { useState } from "react";
import { SmilePlus } from "lucide-react";
import type { ReactionSummary } from "@stalk-talk/types";
import { cn } from "@/lib/utils.js";
import { Button } from "@/components/ui/button.js";

const QUICK_EMOJI = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

type Props = {
  reactions: ReactionSummary[];
  currentUserId: string;
  onToggle: (emoji: string) => void;
};

export const ReactionBar = ({ reactions, currentUserId, onToggle }: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  const pick = (emoji: string) => {
    onToggle(emoji);
    setPickerOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {reactions.map((r) => {
        const reacted = r.userIds.includes(currentUserId);
        return (
          <button
            key={r.emoji}
            type="button"
            onClick={() => onToggle(r.emoji)}
            className={cn(
              "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs",
              reacted ? "reacted border-primary bg-primary/10" : "border-border bg-background"
            )}
          >
            <span>{r.emoji}</span>
            <span>{r.userIds.length}</span>
          </button>
        );
      })}

      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => setPickerOpen((v) => !v)}
          aria-label="Add reaction"
        >
          <SmilePlus className="h-3 w-3" />
        </Button>
        {pickerOpen && (
          <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-md border border-border bg-card p-1 shadow-sm">
            {QUICK_EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => pick(emoji)}
                className="rounded px-1 hover:bg-accent"
                aria-label={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
