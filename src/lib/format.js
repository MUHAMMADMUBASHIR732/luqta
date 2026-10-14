const timeFmt = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Today, 3:40 PM", "Yesterday, 9:05 AM", "12 Oct, 3:40 PM" */
export function formatWhen(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const day = sameDay(date, now) ? "Today" : sameDay(date, yesterday) ? "Yesterday" : dayFmt.format(date);
  return `${day}, ${timeFmt.format(date)}`;
}

export function timeAgo(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

/** Value for <input type="datetime-local"> in local time. */
export function toLocalInputValue(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

export const pluralize = (count, word, plural = `${word}s`) => `${count} ${count === 1 ? word : plural}`;

export const digitsOnly = (value = "") => String(value).replace(/[^\d]/g, "");
