import Link from "next/link";
import Icon from "./Icon";

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
            <Link href="/" aria-label="Back to home"><Icon name="home" size={14} /></Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </>
        )}
      </div>
      <div className="topbar-right">
        <time>{date}</time>
        <button className="icon-btn bordered" aria-label="Notifications">
          <Icon name="bell" size={15} />
        </button>
      </div>
    </header>
  );
}
