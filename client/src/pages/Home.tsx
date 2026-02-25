import { useState } from "react";
import CreatePost from "./CreatePost";
import PostsFeed from "./PostsFeed";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">📚 School</h1>
          <p className="text-muted-foreground mt-1">
            Share messages, files, PDFs and photos with the community
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Create Post Form */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Posts Feed */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Recent Posts
          </h2>
          <PostsFeed refreshTrigger={refreshTrigger} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>A community platform for sharing messages and files</p>
        </div>
      </footer>
    </div>
  );
}
