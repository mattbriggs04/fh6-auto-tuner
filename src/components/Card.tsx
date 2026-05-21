import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
  accent?: string;
  asButton?: boolean;
  onClick?: () => void;
}>;

export function Card({ children, className = "", accent = "#06b6d4", asButton = false, onClick }: CardProps) {
  const Component = asButton ? motion.button : motion.article;

  return (
    <Component
      className={`relative overflow-hidden rounded-[1rem] border border-[#262626] bg-[#141414]/90 text-left ${className}`}
      onClick={onClick}
      whileHover={{ y: -6, borderColor: accent, boxShadow: `0 0 34px ${accent}24` }}
      whileTap={asButton ? { scale: 0.985 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      {children}
    </Component>
  );
}
