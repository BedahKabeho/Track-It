import type { Metadata } from "next";
import LegalModalCard from "@/app/components/LegalModalCard";
import TodoBackground from "@/app/components/TodoBackground";

export const metadata: Metadata = {
  title: "Terms and Conditions — TrackItz",
  description: "Terms and conditions governing the use of TrackItz task and workspace management services.",
};

export default function TermsPage() {
  return (
    <main className="legal-view-screen">
      <TodoBackground />
      <div className="legal-view-backdrop" aria-hidden="true" />
      <div className="legal-view-content">
        <LegalModalCard type="terms" />
      </div>
    </main>
  );
}
