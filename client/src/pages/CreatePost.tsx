import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface Attachment {
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      setText("");
      setAttachments([]);
      toast.success("Post published!");
      onPostCreated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;

    setIsUploading(true);
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(`Upload failed: ${error.error}`);
          continue;
        }

        const data = await response.json();
        setAttachments((prev) => [...prev, data]);
        toast.success(`${file.name} uploaded`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setIsUploading(false);
    e.currentTarget.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() && attachments.length === 0) {
      toast.error("Please add text or files");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        text: text.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6 bg-card border border-border text-center">
        <p className="text-muted-foreground">
          Please log in to create a post
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border border-border mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="text-sm text-muted-foreground">
          Posting as <span className="font-semibold text-foreground">{user.name || "Anonymous"}</span>
        </div>

        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? (max 5000 characters)"
          className="w-full p-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          maxLength={5000}
        />

        {/* Character Count */}
        <div className="text-xs text-muted-foreground">
          {text.length}/5000
        </div>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-border rounded-md p-4 text-center hover:border-border/80 transition-colors">
          <input
            type="file"
            id="file-input"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv"
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isUploading ? "Uploading..." : "Click to add files or drag & drop"}
            </span>
            <span className="text-xs text-muted-foreground">
              Images, PDF, Word, Excel, PowerPoint, ZIP, RAR (max 50MB each)
            </span>
          </label>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Attachments ({attachments.length})
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="relative p-2 bg-background border border-border rounded-md group"
                >
                  {att.fileType.startsWith("image/") ? (
                    <img
                      src={att.fileUrl}
                      alt={att.fileName}
                      className="w-full h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-20 bg-muted rounded flex items-center justify-center text-xs text-center px-1">
                      {att.fileName}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isUploading || (!text.trim() && attachments.length === 0)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
