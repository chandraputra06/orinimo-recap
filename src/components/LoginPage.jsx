
import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@iconify/react";

import mail from "@iconify-icons/lucide/mail";
import lockKeyhole from "@iconify-icons/lucide/lock-keyhole";
import eye from "@iconify-icons/lucide/eye";
import eyeOff from "@iconify-icons/lucide/eye-off";
import arrowRight from "@iconify-icons/lucide/arrow-right";
import arrowUpRight from "@iconify-icons/lucide/arrow-up-right";
import shieldCheck from "@iconify-icons/lucide/shield-check";
import sparkles from "@iconify-icons/lucide/sparkles";
import moon from "@iconify-icons/lucide/moon";
import sun from "@iconify-icons/lucide/sun";
import loaderCircle from "@iconify-icons/lucide/loader-circle";

import { MASCOT_SRC } from "./Mascot.jsx";
import { AppIcon, Service } from "../Visuals.jsx";

import {
  configured,
  demoAllowed,
  supabase,
} from "../data.js";

import { failure } from "../dialogs.js";

// ==========================================
// CONFIGURATION
// ==========================================

const MASCOT_SIZE = 255;

const icon = (data, size = 18) => (
  <Icon
    icon={data}
    width={size}
    height={size}
    aria-hidden="true"
  />
);

// ==========================================
// LOGIN PAGE
// ==========================================

export default function LoginPage({
  onDemo,
  onLoginStart,
  onSuccess,
  onLoginEnd,
  theme = "light",
  onThemeToggle,
}) {
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  // Animasi kemunculan komponen hanya sekali.
  const fadeUp = reduceMotion
    ? {}
    : {
        initial: {
          opacity: 0,
          y: 18,
        },
        animate: {
          opacity: 1,
          y: 0,
        },
        transition: {
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        },
      };

  // ==========================================
  // SUPABASE LOGIN
  // ==========================================

  async function login(event) {
    event.preventDefault();

    if (busy || !configured || !supabase) {
      return;
    }

    const form = new FormData(event.currentTarget);

    const email = String(
      form.get("email") || ""
    ).trim();

    const password = String(
      form.get("password") || ""
    );

    setBusy(true);
    onLoginStart?.();

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw new Error(
          "Email atau password salah. Silakan periksa kembali."
        );
      }

      if (!data?.session) {
        throw new Error(
          "Sesi login tidak tersedia. Silakan coba lagi."
        );
      }

      onSuccess?.(data.session);
    } catch (error) {
      await failure(error);
    } finally {
      setBusy(false);
      onLoginEnd?.();
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="ori-login-v2 relative isolate grid min-h-[100svh] overflow-hidden bg-[#fffaf5] text-[#432f2e] dark:bg-[#151215] dark:text-[#f5eeeb] lg:grid-cols-[1.03fr_.97fr]">

      {/* ======================================
          THEME TOGGLE
          ====================================== */}

      <button
        type="button"
        onClick={onThemeToggle}
        aria-label={
          theme === "dark"
            ? "Aktifkan mode terang"
            : "Aktifkan mode gelap"
        }
        className="ori-mode-switch absolute right-5 top-5 z-30 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ead7d1] bg-white/90 px-4 text-xs font-semibold text-[#7b1e1e] shadow-md backdrop-blur-md hover:bg-[#fff2ed] dark:border-white/15 dark:bg-[#2a2226] dark:text-[#f5c4b9]"
      >
        {icon(theme === "dark" ? sun : moon)}

        <span>
          {theme === "dark" ? "Terang" : "Gelap"}
        </span>
      </button>

      {/* ======================================
          LEFT PANEL - BRANDING
          ====================================== */}

      <section className="ori-login-story relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#651516_5%,#942b25_54%,#cf6044_100%)] px-7 py-7 text-white sm:px-12 lg:min-h-[100svh] lg:px-14 lg:py-12">

        {/* Background decoration */}
        <div
          className="ori-story-orbit ori-story-orbit-a"
          aria-hidden="true"
        />

        <div
          className="ori-story-orbit ori-story-orbit-b"
          aria-hidden="true"
        />

        {/* ======================================
            ORINIMO BRAND LOGO
            ====================================== */}

        <div className="relative z-10 flex items-center gap-3">

          <span className="flex size-11 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg shadow-black/10">
            <AppIcon
              className="h-full w-full object-contain"
              alt="Logo Orinimo"
            />
          </span>

          <div>
            <strong className="block text-xl font-bold tracking-tight">
              orinimo
              <span className="text-[#f9cfac]">
                .
              </span>
            </strong>

            <small className="block text-[9px] font-medium tracking-[.22em] text-[#f6d5cf]">
              ACCOUNT WORKSPACE
            </small>
          </div>
        </div>

        {/* ======================================
            MASCOT AND CONTENT
            ====================================== */}

        <motion.div
          {...fadeUp}
          className="relative z-10 flex flex-col items-center gap-3 py-3 text-center lg:gap-4 lg:py-6"
        >

          {/* Mascot area */}
          <div className="relative flex w-full max-w-[310px] items-center justify-center sm:max-w-[350px] lg:max-w-[420px]">

            {/* Background glow */}
            <div
              aria-hidden="true"
              className="ori-mascot-halo pointer-events-none absolute inset-[9%] rounded-full bg-[radial-gradient(circle,#fff3cc70_0%,#ffb89f27_48%,transparent_72%)]"
            />

            {/* ======================================
                ANIMATED MASCOT
                ====================================== */}

            <img
              src={MASCOT_SRC}
              alt="Maskot Orinimo"
              draggable={false}
              width={MASCOT_SIZE}
              height={MASCOT_SIZE}
              loading="eager"
              decoding="async"
              className="ori-login-mascot-img relative z-10 block h-auto w-full max-w-[255px] select-none object-contain drop-shadow-[0_18px_24px_rgba(44,10,12,.20)]"
              style={{
                transformOrigin: "50% 70%",
                backfaceVisibility: "hidden",
              }}
            />

            {/* Sparkle decorations */}
            <span
              aria-hidden="true"
              className="ori-sparkle pointer-events-none absolute left-[5%] top-[18%] text-2xl text-[#fff0b1]"
            >
              ✦
            </span>

            <span
              aria-hidden="true"
              className="ori-sparkle ori-sparkle-late pointer-events-none absolute right-[7%] top-[27%] text-lg text-[#fff0b1]"
            >
              ✧
            </span>

          </div>

          {/* Main title */}
          <h1 className="max-w-xl text-[clamp(1.9rem,3.5vw,3.1rem)] font-bold leading-[1.15] tracking-[-.055em]">

            Semua akun premium.

            <span className="mt-1 block text-[#ffe2bb]">
              Satu ruang yang seru.
            </span>

          </h1>

          {/* Description */}
          <p className="max-w-[380px] text-xs leading-6 text-[#ffe5dd] sm:text-sm">
            Pantau masa aktif Netflix, Disney+, dan Canva
            dengan lebih rapi bersama maskot Orinimo.
          </p>

          {/* ======================================
              SERVICE ICONS
              ====================================== */}

          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-md">

            <Service kind="netflix" size={35} />

            <Service kind="disney" size={35} />

            <Service kind="canva" size={35} />

            <span className="ml-1 pr-2 text-[10px] font-medium text-white/85">
              Satu dashboard, semua layanan
            </span>

          </div>

        </motion.div>

        {/* Footer */}
        <p className="relative z-10 hidden items-center justify-between text-[10px] font-medium tracking-[.18em] text-[#f3c0b4] lg:flex">
          MADE FOR YOUR EVERYDAY WORKFLOW
          {icon(arrowUpRight)}
        </p>
      </section>

      {/* ======================================
          RIGHT PANEL - LOGIN FORM
          ====================================== */}

      <section className="ori-login-form-wrap flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14">

        <motion.div
          {...fadeUp}
          className="ori-login-form-card w-full max-w-[430px] rounded-[30px] border border-[#f2e1da] bg-white/90 px-6 py-8 shadow-[0_28px_65px_-40px_rgba(86,31,24,.36)] backdrop-blur-xl dark:border-white/10 dark:bg-[#211b20]/95 sm:px-9 sm:py-10"
        >

          <span className="text-[10px] font-bold tracking-[.22em] text-[#aa655c] dark:text-[#eda99e]">
            WELCOME BACK
          </span>

          <h2 className="mt-2 text-2xl font-bold tracking-[-.045em] sm:text-3xl">
            Senang melihatmu lagi.
          </h2>

          <p className="mt-2 text-xs leading-6 text-[#8f7d7c] dark:text-[#baaeb2]">
            Masuk untuk melanjutkan pengelolaan akun Orinimo.
          </p>

          {/* ======================================
              LOGIN FORM
              ====================================== */}

          <form
            onSubmit={login}
            className="mt-8 space-y-5"
          >

            {/* Email field */}
            <label className="block text-xs font-semibold">

              Email admin

              <span className="ori-login-field mt-2 flex items-center gap-3 rounded-2xl border border-[#ecdcd6] bg-[#fffdfb] px-4 py-3 text-[#9b5c52] focus-within:border-[#be7c70] focus-within:ring-4 focus-within:ring-[#7b1e1e]/10 dark:border-white/10 dark:bg-[#2b252b] dark:text-[#f1b3a8]">

                {icon(mail)}

                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="nama@email.com"
                  required
                  disabled={!configured || busy}
                  className="w-full min-w-0 bg-transparent text-[13px] text-[#37292c] outline-none placeholder:text-[#b39c97] dark:text-white"
                />

              </span>

            </label>

            {/* Password field */}
            <label className="block text-xs font-semibold">

              Password

              <span className="ori-login-field mt-2 flex items-center gap-3 rounded-2xl border border-[#ecdcd6] bg-[#fffdfb] px-4 py-3 text-[#9b5c52] focus-within:border-[#be7c70] focus-within:ring-4 focus-within:ring-[#7b1e1e]/10 dark:border-white/10 dark:bg-[#2b252b] dark:text-[#f1b3a8]">

                {icon(lockKeyhole)}

                <input
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  required
                  disabled={!configured || busy}
                  className="w-full min-w-0 flex-1 bg-transparent text-[13px] text-[#37292c] outline-none placeholder:text-[#b39c97] dark:text-white"
                />

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setVisible((current) => !current)
                  }
                  aria-label={
                    visible
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  className="rounded-md p-1 hover:bg-[#f4e3df] dark:hover:bg-[#463139]"
                >
                  {icon(visible ? eyeOff : eye)}
                </button>

              </span>

            </label>

            {/* Login button */}
            <button
              type="submit"
              disabled={!configured || busy}
              className="ori-login-submit flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[#8a2523] px-5 text-[13px] font-semibold text-white shadow-lg shadow-[#81221c]/20 transition hover:-translate-y-0.5 hover:bg-[#6f1b1b] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {busy ? (
                <>
                  <Icon
                    icon={loaderCircle}
                    width={18}
                    height={18}
                    className="animate-spin"
                  />
                  Memeriksa akun...
                </>
              ) : (
                <>
                  Masuk ke workspace
                  {icon(arrowRight)}
                </>
              )}

            </button>

          </form>

          {/* ======================================
              SUPABASE CONFIGURATION INFO
              ====================================== */}

          {!configured && (
            <p className="mt-4 rounded-xl border border-[#ead5c7] bg-[#fff6ed] p-3 text-xs leading-5 text-[#876451] dark:border-[#6a4b43] dark:bg-[#362723] dark:text-[#ecd1bb]">
              Koneksi Supabase belum diatur.
              Isi konfigurasi di file .env agar login admin
              dapat digunakan.
            </p>
          )}

          {/* ======================================
              DEMO MODE
              ====================================== */}

          {demoAllowed && (
            <div className="mt-6">

              <div className="mt-4 flex items-center gap-3 text-[10px] text-[#b3a19e]">
                <span className="h-px flex-1 bg-[#efe1dd]" />
                Coba tampilannya dulu
                <span className="h-px flex-1 bg-[#efe1dd]" />
              </div>

              <button
                type="button"
                onClick={onDemo}
                disabled={busy}
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ebd6cf] text-xs font-semibold text-[#7b1e1e] hover:bg-[#fff0ec] disabled:opacity-50 dark:border-white/20 dark:text-[#e8b5ac] dark:hover:bg-white/5"
              >
                Jelajahi demo interaktif
                {icon(arrowUpRight)}
              </button>

              <p className="mt-2 text-center text-[10px] text-[#a49393]">
                Data contoh tidak tersimpan setelah reload.
              </p>

            </div>
          )}

          {/* Security information */}
          <p className="mt-8 flex items-center justify-center gap-2 text-[10px] text-[#9a8a89] dark:text-[#ada0a6]">
            {icon(shieldCheck, 15)}
            Akses khusus administrator
          </p>

        </motion.div>
      </section>

    </main>
  );
}
