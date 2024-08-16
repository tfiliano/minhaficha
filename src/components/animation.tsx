"use client";

import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

export function AnimationTransitionPage({ children }: PropsWithChildren) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className=" h-[calc(100%-80px)]"
    >
      {children}
    </motion.div>
  );
}
