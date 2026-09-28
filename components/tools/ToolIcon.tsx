import {
  NotebookPen,
  CalendarRange,
  ListChecks,
  Table,
  Ticket,
  Gauge,
  Layers,
  MessageSquare,
  PenLine,
  Mail,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const TOOL_ICONS: Record<string, LucideIcon> = {
  notebook: NotebookPen,
  calendar: CalendarRange,
  "list-checks": ListChecks,
  table: Table,
  ticket: Ticket,
  gauge: Gauge,
  layers: Layers,
  "message-square": MessageSquare,
  "pen-line": PenLine,
  mail: Mail,
};

export function ToolIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = TOOL_ICONS[name] ?? Sparkles;
  return <Icon size={size} />;
}
