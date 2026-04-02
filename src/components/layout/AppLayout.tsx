import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-blob" />
        <div className="absolute top-2/3 right-1/4 w-80 h-80 rounded-full bg-primary/3 blur-3xl animate-blob-delay" />
        <div className="absolute bottom-1/4 left-2/3 w-72 h-72 rounded-full bg-primary/4 blur-3xl animate-blob-delay-2" />
      </div>
      <AppSidebar />
      <main className="flex-1 min-h-screen relative z-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
