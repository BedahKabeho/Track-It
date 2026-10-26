import Link from "next/link";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";

export default function Topbar({ title = "Home" }: { title?: string }) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="topbar">
      <div className="crumb">
        {title === "Home" ? (
          <>
            <Icon name="home" size={14} />
            <span>Home</span>
          </>
        ) : (
          <>
            <Link href="/dashboard" aria-label="Back to dashboard"><Icon name="home" size={14} /></Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </>
        )}
      </div>
      <div className="topbar-right">
        <time>{date}</time>
        <ThemeToggle />
        <Link className="icon-btn bordered" aria-label="Notifications" href="/notifications">
          <Icon name="bell" size={15} />
        </Link>
      </div>
    </header>
  );
}
