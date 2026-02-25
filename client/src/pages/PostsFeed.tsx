import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { FileText, Image as ImageIcon, Download } from "lucide-react";

interface PostsFeedProps {
  refreshTrigger?: number;
}

export default function PostsFeed({ refreshTrigger }: PostsFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);

  const { data, isLoading, refetch } = trpc.messages.list.useQuery();

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  useEffect(() => {
    if (data) {
      setPosts(
        data.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 bg-card border border-border">
            <Skeleton className="h-4 w-1/3 mb-3" />
            <Skeleton className="h-20 w-full mb-3" />
            <Skeleton className="h-40 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="p-12 text-center bg-card border border-border">
        <p className="text-muted-foreground text-lg">
          No posts yet. Be the first to share!
        </p>
      </Card>
    );
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (fileType === "application/pdf") return <FileText className="w-4 h-4" />;
    return <Download className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="overflow-hidden bg-card border border-border hover:border-border/80 transition-colors"
        >
          {/* Author & Time */}
          <div className="p-4 border-b border-border/50">
            <p className="font-semibold text-foreground">
              {post.author.name || "Anonymous"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(post.createdAt, {
                addSuffix: true,
                locale: ru,
              })}
            </p>
          </div>

          {/* Text Content */}
          {post.text && (
            <div className="px-4 pt-4">
              <p className="text-foreground whitespace-pre-wrap break-words">
                {post.text}
              </p>
            </div>
          )}

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="p-4 space-y-3">
              {post.attachments.map((att: any, idx: number) => (
                <div key={idx}>
                  {att.fileType.startsWith("image/") ? (
                    <div className="mb-3">
                      <img
                        src={att.fileUrl}
                        alt={att.fileName}
                        className="max-w-full h-auto rounded-md max-h-96"
                      />
                    </div>
                  ) : null}
                  <a
                    href={att.fileUrl}
                    download={att.fileName}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
                  >
                    {getFileIcon(att.fileType)}
                    <span className="truncate">{att.fileName}</span>
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
