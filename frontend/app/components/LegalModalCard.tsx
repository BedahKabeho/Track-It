"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type LegalDocType = "terms" | "privacy";

type LegalModalCardProps = {
  type: LegalDocType;
  onAgree?: () => void;
  onReject?: () => void;
  isModal?: boolean;
};

const termsContent = {
  title: "Terms and Conditions",
  subtitle: "Your Agreement",
  intro: "Welcome to TrackItz. By using our services, you agree to the following terms and conditions:",
  sections: [
    {
      title: "1. Use of Services",
      content:
        "TrackItz provides a platform for tracking tasks, organizing workspaces, and managing daily productivity. You agree to use our services only for lawful purposes and not to violate any applicable laws or regulations.",
    },
    {
      title: "2. User Account",
      content:
        "To use certain services, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and any activities that occur within it. Please contact us immediately if you notice any suspicious activity.",
    },
    {
      title: "3. Content You Upload",
      content:
        "Any data you upload—including tasks, workspaces, due dates, checklists, or descriptions—remains your property. By uploading this data, you grant TrackItz permission to store and display it solely for the purpose of providing the service to you.",
    },
    {
      title: "4. Data & Privacy Commitment",
      content:
        "We prioritize user privacy. We do not sell your personal data or task details to third-party advertisers. All task synchronization is transmitted securely via modern encryption protocols.",
    },
    {
      title: "5. Service Availability & Updates",
      content:
        "We strive to maintain high service availability, but do not guarantee uninterrupted uptime. We reserve the right to deploy updates, improvements, or modifications to features with reasonable notice.",
    },
    {
      title: "6. Account Termination",
      content:
        "You may cancel your account at any time. We reserve the right to suspend or terminate accounts that repeatedly violate these terms or engage in abusive platform behavior.",
    },
    {
      title: "7. Limitation of Liability",
      content:
        "TrackItz is provided on an 'as is' basis. To the maximum extent permitted by law, TrackItz shall not be liable for any indirect or consequential damages resulting from platform downtime or data loss.",
    },
  ],
};

const privacyContent = {
  title: "Privacy Policy",
  subtitle: "Your Privacy",
  intro: "Welcome to TrackItz. We are dedicated to protecting your privacy and handling your data with transparency:",
  sections: [
    {
      title: "1. Information We Collect",
      content:
        "We only collect information necessary to manage your tasks: your name, email address, an encrypted hash of your password, and the workspace items you create. We do not track you across external sites.",
    },
    {
      title: "2. How We Use Your Data",
      content:
        "Your information is utilized solely to authenticate your sessions, synchronize your tasks across devices, generate deadlines, and prevent platform abuse. We never sell your personal information.",
    },
    {
      title: "3. Data Security & Storage",
      content:
        "We employ TLS 1.3 encryption in transit and salted hashes at rest to ensure that your passwords and task records are safeguarded from unauthorized access.",
    },
    {
      title: "4. Content Ownership",
      content:
        "You retain 100% ownership of your tasks and workspace notes. We do not train external public AI models on your private productivity data.",
    },
    {
      title: "5. Cookies & Local Session Tokens",
      content:
        "We use essential cookies and local storage tokens strictly required to maintain your active authenticated session and remember user preferences such as Dark Mode.",
    },
    {
      title: "6. Your Data Rights & Deletion",
      content:
        "You can inspect, export, edit, or request permanent deletion of your account and all associated workspace records at any time through your settings or by emailing support@trackitz.com.",
    },
    {
      title: "7. Policy Updates",
      content:
        "We may occasionally revise this Privacy Policy to reflect platform enhancements. Significant updates will be communicated clearly within the application.",
    },
  ],
};

export default function LegalModalCard({
  type,
  onAgree,
  onReject,
  isModal = false,
}: LegalModalCardProps) {
  const router = useRouter();
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);
  const data = type === "terms" ? termsContent : privacyContent;

  function handleAgree() {
    if (onAgree) {
      onAgree();
    } else {
      router.push("/signup?agreed=true");
    }
  }

  function handleReject() {
    if (onReject) {
      onReject();
    } else {
      setShowRejectionMessage(true);
    }
  }

  return (
    <div className={`legal-modal-card ${isModal ? "in-modal" : "standalone"}`}>
      {/* Header */}
      <header className="legal-modal-header">
        <h1 className="legal-modal-title">{data.title}</h1>
        <p className="legal-modal-subtitle">{data.subtitle}</p>
      </header>

      {/* Scrollable Content Body */}
      <div className="legal-modal-scroll-wrap">
        <div className="legal-modal-scroll-body" tabIndex={0} role="region" aria-label={data.title}>
          <p className="legal-modal-intro">{data.intro}</p>

          <div className="legal-modal-sections">
            {data.sections.map((section) => (
              <section key={section.title} className="legal-modal-section">
                <h2 className="legal-modal-section-title">{section.title}</h2>
                <p className="legal-modal-section-text">{section.content}</p>
              </section>
            ))}
          </div>
        </div>

        {/* Fading bottom indicator matching user screenshot */}
        <div className="legal-modal-fade-bottom" aria-hidden="true" />
      </div>

      {/* Bottom Actions matching user screenshot */}
      <footer className="legal-modal-actions">
        {showRejectionMessage && (
          <p className="legal-rejection-message" role="alert">
            You can not continue with the website if you do not agree with the conditions
          </p>
        )}
        {isModal ? (
          <>
            <button
              type="button"
              className="legal-btn-reject"
              onClick={handleReject}
            >
              Reject
            </button>
            <button
              type="button"
              className="legal-btn-agree"
              onClick={handleAgree}
            >
              Agree
            </button>
          </>
        ) : (
          <>
            <button type="button" className="legal-btn-reject" onClick={handleReject}>
              Reject
            </button>
            <button
              type="button"
              className="legal-btn-agree"
              onClick={handleAgree}
            >
              Agree
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
