import { useState } from "react";
import CreateMessage from "./CreateMessage";
import MessageBoard from "./MessageBoard";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMessageCreated = () => {
    // Trigger message board refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Message Board</h1>
          <p className="text-muted-foreground mt-1">
            Share your thoughts with the community
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Create Message Form */}
        <CreateMessage onMessageCreated={handleMessageCreated} />

        {/* Messages Grid */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Recent Messages
          </h2>
          <MessageBoard refreshTrigger={refreshTrigger} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>A simple message board for sharing thoughts and photos</p>
        </div>
      </footer>
    </div>
  );
}
