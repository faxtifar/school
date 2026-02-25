import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface CreateMessageProps {
  onMessageCreated?: () => void;
}

export default function CreateMessage({ onMessageCreated }: CreateMessageProps) {
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      setText("");
      setSelectedFile(null);
      setPreview(null);
      toast.success("Message posted!");
      onMessageCreated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post message");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to post");
      return;
    }

    setIsUploading(true);

    try {
      let photoUrl: string | undefined;
      let photoKey: string | undefined;

      // Upload image to S3 if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        photoUrl = uploadData.url;
        photoKey = uploadData.key;
      }

      // Create message
      await createMutation.mutateAsync({
        text: text.trim(),
        photoUrl,
        photoKey,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to post message"
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6 mb-8 bg-card border border-border">
        <div className="text-center">
          <p className="text-foreground mb-4">
            Sign in to share your thoughts with the community
          </p>
          <a href={getLoginUrl()}>
            <Button>Sign In</Button>
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-8 bg-card border border-border">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Posting as <span className="font-semibold text-foreground">{user?.name}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            placeholder="What's on your mind? (max 1000 characters)"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            disabled={isUploading || createMutation.isPending}
            className="min-h-24 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {text.length}/1000
          </p>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* File Input */}
        <div className="flex items-center gap-2">
          <label htmlFor="image-input" className="cursor-pointer">
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading || createMutation.isPending}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image-input")?.click()}
              disabled={isUploading || createMutation.isPending}
              className="cursor-pointer"
            >
              <ImagePlus size={16} className="mr-2" />
              Add Photo
            </Button>
          </label>
          {selectedFile && (
            <span className="text-sm text-muted-foreground">
              {selectedFile.name}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUploading || createMutation.isPending || !text.trim()}
          >
            {isUploading || createMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Message"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
