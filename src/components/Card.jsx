import { cn } from "../lib/cn.js";

const PADDING = { none: "", sm: "p-4", md: "p-5 sm:p-6", lg: "p-6 sm:p-8" };

export default function Card({ as: Tag = "div", padding = "md", interactive = false, className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-line/80 bg-white shadow-soft",
        interactive && "transition-[box-shadow,transform] duration-300 ease-[var(--ease-luqta)] hover:-translate-y-1 hover:border-rose/40 hover:shadow-lift",
        PADDING[padding],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
