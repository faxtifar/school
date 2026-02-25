import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface Message {
  id: number;
  text: string;
  photoUrl: string | null;
  createdAt: Date;
  author: {
    id: number;
    name: string | null;
  };
}

interface MessageBoardProps {
  refreshTrigger?: number;
}

export default function MessageBoard({ refreshTrigger }: MessageBoardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, refetch } = trpc.messages.list.useQuery();

  // Refetch messages when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      setIsRefreshing(true);
      refetch().finally(() => setIsRefreshing(false));
    }
  }, [refreshTrigger, refetch]);

  // Update messages when data changes
  useEffect(() => {
    if (data) {
      setMessages(
        data.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 bg-card border border-border">
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-20 w-full mb-3" />
            <Skeleton className="h-40 w-full mb-3" />
            <Skeleton className="h-3 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <Card className="p-12 text-center bg-card border border-border">
        <p className="text-muted-foreground text-lg">
          No messages yet. Be the first to share something!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {messages.map((message) => (
        <Card
          key={message.id}
          className="overflow-hidden bg-card border border-border hover:border-border/80 transition-colors flex flex-col"
        >
          {/* Image */}
          {message.photoUrl && (
            <div className="relative w-full h-48 bg-muted overflow-hidden">
              <img
                src={message.photoUrl}
                alt="Message attachment"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4 flex flex-col flex-grow">
            {/* Author & Time */}
            <div className="mb-3 pb-3 border-b border-border/50">
              <p className="font-semibold text-foreground text-sm">
                {message.author.name || "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(message.createdAt, {
                  addSuffix: true,
                  locale: ru,
                })}
              </p>
            </div>

            {/* Message Text */}
            <p className="text-foreground text-sm leading-relaxed flex-grow break-words">
              {message.text}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
