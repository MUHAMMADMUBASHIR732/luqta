import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../lib/cn.js";
import { DUR, EASE } from "../lib/motion.js";

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-rose shadow-soft",
  secondary: "bg-rose text-white hover:bg-brand shadow-soft",
  accent: "bg-ember text-ink-950 hover:brightness-105 shadow-soft",
  dark: "bg-ink text-cream hover:bg-ink-950 shadow-soft",
  outline: "border border-line bg-white text-ink hover:border-rose/50 hover:bg-sand",
  ghost: "text-ink hover:bg-sand",
};

const SIZES = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-7 text-lg",
};

const MotionLink = motion.create(Link);

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, to, href, icon: Icon, iconEnd: IconEnd, className, children, disabled, type = "button", ...rest },
  ref
) {
  const classes = cn(
    "group shine inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200",
    "disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55",
    VARIANTS[variant],
    SIZES[size],
    className
  );
  const content = (
    <>
      {loading ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : Icon && <Icon className="h-5 w-5 transition-transform duration-300 ease-[var(--ease-luqta)] group-hover:scale-110 group-hover:-rotate-6" strokeWidth={1.75} aria-hidden="true" />}
      <span>{children}</span>
      {!loading && IconEnd && <IconEnd className="h-5 w-5 transition-transform duration-300 ease-[var(--ease-luqta)] group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" strokeWidth={1.75} aria-hidden="true" />}
    </>
  );
  const motionProps = {
    whileHover: disabled || loading ? undefined : { y: -1 },
    whileTap: disabled || loading ? undefined : { scale: 0.97 },
    transition: { duration: DUR.micro, ease: EASE },
  };

  if (to) {
    return (
      <MotionLink ref={ref} to={to} className={classes} {...motionProps} {...rest}>
        {content}
      </MotionLink>
    );
  }
  if (href) {
    return (
      <motion.a ref={ref} href={href} className={classes} {...motionProps} {...rest}>
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...motionProps}
      {...rest}
    >
      {content}
    </motion.button>
  );
});

export default Button;
