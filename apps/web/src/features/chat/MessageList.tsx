import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Message } from "@stalk-talk/types";
import { cn } from "@/lib/utils.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { ReactionBar } from "./ReactionBar.js";

type Props = {
  messages: Message[];
  currentUserId: string;
  onEdit?: (messageId: string, text: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
};

export const MessageList = ({ messages, currentUserId, onEdit, onDelete, onReact }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (messages.length === 0) return <p className="text-sm text-muted-foreground">No messages yet</p>;

  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setDraft(msg.text);
  };

  const submitEdit = (e: React.FormEvent, messageId: string) => {
    e.preventDefault();
    onEdit?.(messageId, draft);
    setEditingId(null);
  };

  return (
    <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
      {messages.map((msg) => {
        const isOwn = msg.userId === currentUserId;
        const isDeleted = Boolean(msg.deletedAt);
        const isEditing = editingId === msg.id;

        return (
          <li
            key={msg.id}
            className={cn(
              "group flex max-w-[75%] flex-col gap-1",
              isOwn ? "own self-end items-end" : "other self-start items-start"
            )}
          >
            <div
              className={cn(
                "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
                isOwn ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}
            >
              {isEditing ? (
                <form onSubmit={(e) => submitEdit(e, msg.id)} className="flex gap-1">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="h-7 text-sm text-foreground"
                  />
                </form>
              ) : isDeleted ? (
                <span className="italic opacity-70">Message deleted</span>
              ) : (
                <span>
                  {msg.text}
                  {msg.editedAt && <span className="ml-1 text-xs opacity-70">(edited)</span>}
                </span>
              )}

              {isOwn && !isDeleted && !isEditing && (
                <span className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => startEdit(msg)}
                    aria-label="Edit message"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => onDelete?.(msg.id)}
                    aria-label="Delete message"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </span>
              )}
            </div>

            {!isDeleted && (
              <ReactionBar
                reactions={msg.reactions ?? []}
                currentUserId={currentUserId}
                onToggle={(emoji) => onReact?.(msg.id, emoji)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
