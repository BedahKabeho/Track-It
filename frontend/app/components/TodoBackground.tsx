import Icon from "./Icon";

export default function TodoBackground() {
  return (
    <div className="todo-bg-container" aria-hidden="true">
      {/* Ambient gradient glow spots */}
      <div className="todo-bg-glow glow-top-left" />
      <div className="todo-bg-glow glow-bottom-right" />
      <div className="todo-bg-glow glow-center" />

      {/* Lined / Dot Planner Grid Texture */}
      <div className="todo-bg-grid" />

      {/* Faint Decorative Watermark Stamps */}
      <div className="todo-bg-stamps">
        <div className="todo-bg-stamp stamp-top-left">
          <Icon name="check-circle" size={96} strokeWidth={1} />
        </div>
        <div className="todo-bg-stamp stamp-top-center">
          <Icon name="check-circle" size={88} strokeWidth={1} />
        </div>
        <div className="todo-bg-stamp stamp-top-right">
          <Icon name="check-square" size={84} strokeWidth={1} />
        </div>
        <div className="todo-bg-stamp stamp-bottom-left">
          <Icon name="check-square" size={90} strokeWidth={1} />
        </div>
        <div className="todo-bg-stamp stamp-bottom-center">
          <Icon name="check-square" size={72} strokeWidth={1} />
        </div>
        <div className="todo-bg-stamp stamp-bottom-right">
          <Icon name="check-circle" size={100} strokeWidth={1} />
        </div>
      </div>
    </div>
  );
}
