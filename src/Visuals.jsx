import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@iconify/react";
import arrowRight from "@iconify-icons/lucide/arrow-right";
import moon from "@iconify-icons/lucide/moon";
import sun from "@iconify-icons/lucide/sun";

const appIcon =
  document.querySelector('link[rel~="icon"]')?.href || "/logo-orinimo.png";

export function AppIcon({ className = "", ...props }) {
  return <img src={appIcon} alt="" className={className} {...props} />;
}

export function Service({ kind, size }) {
  const disney = kind === "disney";

  return (
    <span
      className={`service service-logo ${kind}`}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label={
        disney ? "Disney+" : kind === "week" ? "Netflix 1 Week" : "Netflix"
      }
    >
      <img
        src={disney ? "/brands/disney-plus.png" : "/brands/netflix-n.png"}
        alt=""
      />

      {kind === "week" && <small aria-hidden="true">7</small>}
    </span>
  );
}

export const NetflixIcon = ({ size = 28 }) => (
  <Service kind="netflix" size={size} />
);

export const WeekIcon = ({ size = 28 }) => <Service kind="week" size={size} />;

export const DisneyIcon = ({ size = 28 }) => (
  <Service kind="disney" size={size} />
);

export function WelcomeScreen({ user, onComplete, theme, onThemeToggle }) {
  const prefersReducedMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const heading = useRef(null);

  const name =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Admin";

  useEffect(() => {
    heading.current?.focus();

    const timer = setTimeout(() => setLeaving(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!leaving) return;

    const timer = setTimeout(onComplete, prefersReducedMotion ? 0 : 360);
    return () => clearTimeout(timer);
  }, [leaving, onComplete, prefersReducedMotion]);

  return (
    <motion.main
      className={`welcome-screen relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#f7f8fa] px-5 py-16 text-[#242731] dark:bg-[#121216] dark:text-[#f5f1ef] ${
        leaving ? "pointer-events-none" : ""
      }`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{
        opacity: leaving ? 0 : 1,
        y: prefersReducedMotion ? 0 : leaving ? 8 : 0,
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.36,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        type="button"
        className="theme-toggle welcome-theme-toggle"
        onClick={onThemeToggle}
        aria-label={`Aktifkan mode ${theme === "dark" ? "terang" : "gelap"}`}
      >
        <Icon icon={theme === "dark" ? sun : moon} width={18} height={18} />
        <span>{theme === "dark" ? "Terang" : "Gelap"}</span>
      </button>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-44 -top-48 size-[32rem] rounded-full bg-[#e9c9bb]/40 blur-3xl dark:bg-[#7b1e1e]/20" />
        <div className="absolute -bottom-56 -right-36 size-[34rem] rounded-full bg-[#e7d6ac]/35 blur-3xl dark:bg-[#7a5d34]/10" />
      </div>
      <div className="welcome-content relative z-10 flex w-full max-w-5xl flex-col items-center gap-8 rounded-[2rem] border border-[#ece7e4] bg-white/85 px-6 py-10 text-center shadow-[0_30px_90px_-40px_rgba(70,32,24,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1c1b20]/90 md:flex-row md:gap-14 md:px-14 md:py-16 md:text-left">
        <div className="relative flex aspect-square w-48 shrink-0 items-center justify-center rounded-full bg-[#fff7ed] p-3 shadow-inner shadow-[#7b1e1e]/10 dark:bg-[#272228] sm:w-60 md:w-72">
          <span className="absolute inset-2 rounded-full border border-[#ead9ca] dark:border-white/10" />
          <AppIcon className="relative z-10 h-full w-full object-contain drop-shadow-xl" />
        </div>
        <div className="flex flex-col items-center md:items-start">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.24em] text-[#9b655d] dark:text-[#d6a29a]">
            ORINIMO WORKSPACE
          </p>
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-3xl font-semibold leading-tight tracking-[-0.055em] text-[#242731] dark:text-white sm:text-4xl md:text-5xl"
          >
            Selamat datang,
            <br />
            <span className="text-[#7b1e1e] dark:text-[#e7aaa1]">{name}.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#737784] dark:text-[#b8b5bd]">
            Login berhasil. Mari lanjutkan harimu dengan lebih teratur.
          </p>
          <button
            type="button"
            onClick={() => setLeaving(true)}
            disabled={leaving}
            className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#7b1e1e] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#7b1e1e]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#591515] hover:shadow-xl disabled:cursor-wait disabled:opacity-70"
          >
            Masuk ke dashboard
            <Icon icon={arrowRight} width={18} height={18} />
          </button>
          <p className="mt-8 text-[9px] font-medium tracking-[0.22em] text-[#aaa4a0] dark:text-[#8e8990]">
            SEMUA AKUN. SATU RUANG.
          </p>
        </div>
      </div>
    </motion.main>
  );
}
