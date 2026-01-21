"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface CTAButtonProps {
  children: ReactNode;
  href: string;
}

export function CTAButton({ children, href }: CTAButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className="group inline-flex h-16 items-center justify-center rounded-2xl bg-white px-10 text-lg font-bold text-blue-600 shadow-2xl shadow-black/20 transition-all hover:scale-[1.02] hover:shadow-3xl"
      onClick={() => (window.location.href = href)}
    >
      {children}
      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
    </motion.button>
  );
}
