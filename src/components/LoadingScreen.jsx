
import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@iconify/react";

import sun from "@iconify-icons/lucide/sun";
import moon from "@iconify-icons/lucide/moon";

import { AppIcon } from "../Visuals.jsx";
import Mascot from "./Mascot.jsx";

export default function LoadingScreen({
  text = "Menyiapkan ruang kerjamu...",
  theme = "light",
  onThemeToggle,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <main
      aria-busy="true"
      aria-label={text}
      className="ori-loading-v2 relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#fff8f3] px-6 text-[#512f2b] dark:bg-[#171316] dark:text-[#f9eeea]"
    >
      <button
        type="button"
        onClick={onThemeToggle}
        className="ori-mode-switch absolute right-5 top-5 z-10 flex min-h-10 items-center gap-2 rounded-full border border-[#ecd8d0] bg-white/80 px-4 text-xs font-semibold text-[#8b3228] dark:border-white/15 dark:bg-[#30252a] dark:text-[#f2b1a2]"
        aria-label="Ganti tema"
      >
        <Icon
          icon={theme === "dark" ? sun : moon}
          width={17}
          height={17}
        />
        {theme === "dark" ? "Terang" : "Gelap"}
      </button>

      <div
        aria-hidden="true"
        className="ori-loading-glow absolute inset-0"
      />

      <div className="relative z-10 flex w-full max-w-[480px] flex-col items-center text-center">

        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-[#f5dfd7] bg-white/85 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-[#2b2228]">
          <AppIcon className="size-7 object-contain" alt="" />

          <span className="text-sm font-bold tracking-tight">
            orinimo<span className="text-[#ba5746]">.</span>
          </span>
        </div>

        <div className="relative flex h-[240px] w-[260px] items-center justify-center sm:h-[310px] sm:w-[320px]">

          <div className="absolute inset-5 rounded-full bg-[radial-gradient(circle,#ffddb8aa_0%,#f8c2b55c_47%,transparent_74%)] dark:bg-[radial-gradient(circle,#9a494b48_0%,transparent_72%)]" />

          <Mascot
            variant="bounce"
            size={245}
            decorative
            className="relative drop-shadow-[0_22px_30px_rgba(112,51,31,.2)]"
          />
        </div>

        <h1 className="mt-2 text-[26px] font-bold tracking-[-.05em]">
          Sedang menyiapkan semuanya!
        </h1>

        <p className="mt-2 text-xs leading-6 text-[#986d67] dark:text-[#cbaaa8]">
          {text}
        </p>

        <div
          className="mt-7 h-2 w-56 overflow-hidden rounded-full bg-[#ebd5ca] dark:bg-white/10"
          aria-hidden="true"
        >
          <motion.div
            className="h-full w-1/3 rounded-full bg-[linear-gradient(90deg,#a5322b,#e99c6d)]"
            animate={
              reduceMotion
                ? { x: 0 }
                : { x: ["-100%", "300%"] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 1.4,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }
            }
          />
        </div>

        <p className="mt-4 text-[10px] font-semibold tracking-[.18em] text-[#c08f86] dark:text-[#ad8789]">
          SEMUA AKUN. SATU RUANG.
        </p>
      </div>
    </main>
  );
}
