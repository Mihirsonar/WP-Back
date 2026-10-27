export const USerRoleEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};
export const AvailableRoles = Object.values(USerRoleEnum);

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};
export const AvailableTaskStatus = Object.values(TaskStatusEnum);

export const DEFAULT_LISTS = [
  { title: "Todo", color: "#6366f1", position: 0 },
  { title: "In Progress", color: "#f97316", position: 1 },
  { title: "Done", color: "#10b981", position: 2 },
];

export const LABEL_COLORS = [
  { name: "Green", color: "#22c55e" },
  { name: "Yellow", color: "#eab308" },
  { name: "Orange", color: "#f97316" },
  { name: "Red", color: "#ef4444" },
  { name: "Purple", color: "#a855f7" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Cyan", color: "#06b6d4" },
  { name: "Pink", color: "#ec4899" },
];
