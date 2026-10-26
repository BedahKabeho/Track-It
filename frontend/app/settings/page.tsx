"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { API_BASE_URL, apiRequest, getToken, type Account } from "@/lib/api";
import "./settings.css";

type Provider = "google" | "github";

const providerNames: Record<Provider, string> = {
  google: "Google",
  github: "GitHub",
};

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getSocialResult() {
  const params = new URLSearchParams(window.location.search);
  const linked = params.get("social_linked");
  if (linked && linked in providerNames) return `linked:${linked}`;
  const failed = params.get("social_failed");
  if (failed && failed in providerNames) return `failed:${failed}`;
  return "";
}

export default function SettingsPage() {
  const router = useRouter();
  const socialResult = useSyncExternalStore(
    subscribeToLocation,
    getSocialResult,
    () => "",
  );
  const [profile, setProfile] = useState<Account | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [linkError, setLinkError] = useState("");
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<Provider | null>(null);

  const [resultType, resultProvider] = socialResult.split(":");
  const message = resultType === "linked" && resultProvider in providerNames
    ? `${providerNames[resultProvider as Provider]} is now linked to your Track-It account.`
    : "";
  const callbackError = resultType === "failed" && resultProvider in providerNames
    ? `Could not link ${providerNames[resultProvider as Provider]}. It may already be linked to another Track-It account. Please try again or contact support.`
    : "";

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    let active = true;
    Promise.all([
      apiRequest<{ user: Account }>("/api/auth/me/"),
      apiRequest<{ providers: Provider[] }>("/api/auth/social-accounts/"),
    ]).then(([account, socialAccounts]) => {
      if (!active) return;
      setProfile(account.user);
      setProviders(socialAccounts.providers);
    }).catch((loadError) => {
      if (active) {
        setLinkError(loadError instanceof Error ? loadError.message : "Could not load account settings.");
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [router]);

  async function linkProvider(provider: Provider) {
    setLinkError("");
    setLinking(provider);
    try {
      const { ticket } = await apiRequest<{ ticket: string }>(
        "/api/auth/social-accounts/link-ticket/",
        {
          method: "POST",
          body: JSON.stringify({ provider }),
        },
      );
      const startUrl = new URL(`${API_BASE_URL}/auth/${provider}/link/`);
      startUrl.searchParams.set("ticket", ticket);
      window.location.assign(startUrl.toString());
    } catch (linkError) {
      setLinkError(linkError instanceof Error ? linkError.message : `Could not start ${providerNames[provider]} linking.`);
      setLinking(null);
    }
  }

  return (
    <div className="shell">
      <Sidebar profile={profile ?? undefined} workspaces={[]} />
      <div className="main">
        <Topbar title="Account settings" />
        <main className="content settings-content">
          <header className="settings-heading">
            <p className="eyebrow">Your account</p>
            <h1>Account settings</h1>
            <p>Manage your sign-in methods and securely connect a social account.</p>
          </header>

          {message && <p className="settings-feedback success" role="status">{message}</p>}
          {(callbackError || linkError) && <p className="settings-feedback error" role="alert">{callbackError || linkError}</p>}
          {loading ? <p className="dashboard-state">Loading account settings…</p> : profile && (
            <>
              <section className="settings-card" aria-labelledby="account-details-heading">
                <h2 id="account-details-heading">Track-It account</h2>
                <dl className="settings-details">
                  <div><dt>Name</dt><dd>{profile.full_name}</dd></div>
                  <div><dt>Email</dt><dd>{profile.email || "No email on file"}</dd></div>
                </dl>
              </section>

              <section className="settings-card" aria-labelledby="connected-accounts-heading">
                <h2 id="connected-accounts-heading">Connected sign-in methods</h2>
                <p className="settings-description">
                  Sign in with your existing method first. Linking a provider here connects it to this account; matching email addresses alone never link accounts.
                </p>
                <div className="provider-list">
                  {(["google", "github"] as const).map((provider) => {
                    const connected = providers.includes(provider);
                    return (
                      <div className="provider-row" key={provider}>
                        <div>
                          <strong>{providerNames[provider]}</strong>
                          <span>{connected ? "Connected to this account" : "Not connected"}</span>
                        </div>
                        {connected ? (
                          <span className="provider-connected">Connected</span>
                        ) : (
                          <button
                            className="btn-primary provider-button"
                            type="button"
                            disabled={linking !== null}
                            onClick={() => void linkProvider(provider)}
                          >
                            {linking === provider ? "Connecting…" : `Link ${providerNames[provider]}`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
