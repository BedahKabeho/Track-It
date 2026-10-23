import Icon from "./Icon";

export default function Topbar() {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="topbar">
      <div className="crumb">
        <Icon name="home" size={14} />
        <span>Home</span>
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
