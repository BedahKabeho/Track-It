import type { Metadata } from "next";
import LegalModalCard from "@/app/components/LegalModalCard";
import TodoBackground from "@/app/components/TodoBackground";

export const metadata: Metadata = {
  title: "Privacy Policy — TrackItz",
  description: "Learn how TrackItz collects, protects, and respects your task and personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-view-screen">
      <TodoBackground />
      <div className="legal-view-backdrop" aria-hidden="true" />
      <div className="legal-view-content">
        <LegalModalCard type="privacy" />
      </div>
    </main>
  );
}
