"use client";

import { motion } from "framer-motion";
import { useIsFetching } from "@tanstack/react-query";

export function ChronoCompanion() {
  const isFetching = useIsFetching();

  return (
    <motion.div
      className="fixed top-1/2 right-4 -translate-y-1/2 z-[60] cursor-grab active:cursor-grabbing touch-none"
      drag
      dragMomentum={false}
      // Keeps it roughly on the right side of the screen so it doesn't cover content
      dragConstraints={{ top: -200, bottom: 200, left: -100, right: 0 }} 
    >
      <motion.svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        animate={isFetching > 0 ? "fetching" : "idle"}
        initial="idle" // <--- ADD THIS LINE
      >
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          stroke="var(--theme-accent, #a78bfa)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          variants={{
            idle: {
              rotate: 0,
              scale: 1,
              opacity: 0.3,
              strokeDasharray: "80 40",
              transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            },
            fetching: {
              rotate: 360,
              scale: [1, 1.15, 1],
              opacity: [0.6, 1, 0.6],
              strokeDasharray: "20 100",
              transition: { duration: 1.2, repeat: Infinity, ease: "linear" },
            },
          }}
          style={{ transformOrigin: "center" }}
        />
        <motion.circle
          cx="24"
          cy="24"
          r="6"
          fill="var(--theme-accent, #a78bfa)"
          variants={{
            idle: {
              scale: [1, 1.2, 1],
              opacity: 0.2,
              transition: { duration: 3, repeat: Infinity },
            },
            fetching: {
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.9, 0.5],
              transition: { duration: 0.8, repeat: Infinity },
            },
          }}
        />
      </motion.svg>
    </motion.div>
  );
}
