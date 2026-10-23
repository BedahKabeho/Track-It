import type { WorkspaceIcon as IconName } from "@/lib/data";
import Icon from "./Icon";

const icons = { code: "code", book: "book", briefcase: "briefcase" } as const;

export default function WorkspaceIcon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <Icon name={icons[name]} size={size} />;
}
