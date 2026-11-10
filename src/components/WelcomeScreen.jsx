
import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@iconify/react";

import arrowRight from "@iconify-icons/lucide/arrow-right";
import sun from "@iconify-icons/lucide/sun";
import moon from "@iconify-icons/lucide/moon";
import sparkles from "@iconify-icons/lucide/sparkles";

import { AppIcon } from "../Visuals.jsx";
import Mascot from "./Mascot.jsx";

export default function WelcomeScreen({
  user,
  onComplete,
  theme = "light",
  onThemeToggle,
}) {
  const reduceMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const headingRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const name =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Admin";

  useEffect(() => {
    headingRef.current?.focus();

    const timer = window.setTimeout(() => {
      setLeaving(true);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!leaving) return;

    const timer = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current?.();
    }, reduceMotion ? 0 : 350);

    return () => window.clearTimeout(timer);
  }, [leaving, reduceMotion]);

  return (
    <motion.main
      className="ori-welcome-v2 relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#fff8f3] px-5 py-12 text-[#482e2e] dark:bg-[#181316] dark:text-white"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{
        opacity: leaving ? 0 : 1,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.35,
      }}
    >
      {/* BACKGROUND */}
      <div
        className="ori-welcome-glow pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      {/* THEME */}
      <button
        type="button"
        onClick={onThemeToggle}
        className="absolute right-5 top-5 z-20 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#eed9d1] bg-white/85 px-4 text-xs font-semibold text-[#8b3228] dark:border-white/15 dark:bg-[#30242a] dark:text-[#f5b9a9]"
        aria-label={`Aktifkan mode ${
          theme === "dark" ? "terang" : "gelap"
        }`}
      >
        <Icon
          icon={theme === "dark" ? sun : moon}
          width={17}
          height={17}
        />
        {theme === "dark" ? "Terang" : "Gelap"}
      </button>

      {/* CONTENT */}
      <div className="relative z-10 grid w-full max-w-[960px] items-center gap-7 rounded-[36px] border border-[#f0d9d2] bg-white/90 px-7 py-9 shadow-[0_30px_85px_-40px_rgba(102,29,28,.36)] backdrop-blur-xl dark:border-white/10 dark:bg-[#241d23]/95 sm:px-12 md:grid-cols-[.95fr_1.05fr] md:gap-10 md:py-14">

        {/* MASCOT */}
        <div className="relative flex min-h-[300px] items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,#ffe6bd,#f7beb786_55%,transparent_76%)] dark:bg-[radial-gradient(circle,#6c3a3e,#492f3629_65%,transparent_80%)]"
          />

          <Mascot
            variant="cheer"
            size={300}
            decorative
            className="relative z-10 drop-shadow-[0_22px_27px_rgba(84,30,24,.14)]"
          />

          <Icon
            icon={sparkles}
            width={26}
            height={26}
            className="ori-sparkle absolute left-3 top-8 text-[#eab365]"
            aria-hidden="true"
          />
        </div>

        {/* TEXT */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-5 flex items-center gap-2 rounded-full border border-[#f0d9d0] bg-[#fff5f0] px-3 py-2 dark:border-white/10 dark:bg-[#372a30]">
            <AppIcon
              className="size-6 object-contain"
              alt=""
            />

            <span className="text-[10px] font-bold tracking-[.17em] text-[#9b5c54] dark:text-[#edb4a7]">
              ORINIMO WORKSPACE
            </span>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#ab6b60] dark:text-[#df9e93]">
            Yeay, berhasil masuk!
          </p>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-3xl font-bold leading-[1.14] tracking-[-.055em] outline-none sm:text-4xl lg:text-5xl"
          >
            Selamat datang kembali,
            <span className="mt-2 block break-words text-[#a8322a] dark:text-[#f0b0a4]">
              {name}!
            </span>
          </h1>

          <p className="mt-5 max-w-sm text-[13px] leading-7 text-[#917978] dark:text-[#c3b4b8]">
            Orinimo sudah siap menemanimu. Semua akun
            premium, reminder, dan rekapan ada di satu ruang.
          </p>

          <button
            type="button"
            disabled={leaving}
            onClick={() => setLeaving(true)}
            className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-2xl bg-[#8a2523] px-6 text-xs font-semibold text-white shadow-lg shadow-[#8a2523]/20 transition hover:-translate-y-0.5 hover:bg-[#681a1b] disabled:cursor-wait disabled:opacity-70"
          >
            Masuk ke dashboard

            <Icon
              icon={arrowRight}
              width={18}
              height={18}
            />
          </button>

          <p className="mt-5 text-[10px] font-medium text-[#a38f8e] dark:text-[#ad9da3]">
            Otomatis masuk setelah sapaan singkat.
          </p>
        </div>
      </div>
    </motion.main>
  );
}
