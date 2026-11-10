
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import { Icon } from "@iconify/react";
import dashboardIcon from "@iconify-icons/lucide/layout-dashboard";
import calendarIcon from "@iconify-icons/lucide/calendar-days";
import clapperboard from "@iconify-icons/lucide/clapperboard";
import bell from "@iconify-icons/lucide/bell";
import settingsIcon from "@iconify-icons/lucide/settings-2";
import plus from "@iconify-icons/lucide/plus";
import download from "@iconify-icons/lucide/download";
import upload from "@iconify-icons/lucide/upload";
import search from "@iconify-icons/lucide/search";
import sliders from "@iconify-icons/lucide/sliders-horizontal";
import chevronRight from "@iconify-icons/lucide/chevron-right";
import chevronLeft from "@iconify-icons/lucide/chevron-left";
import arrowUpRight from "@iconify-icons/lucide/arrow-up-right";
import check from "@iconify-icons/lucide/check";
import circleCheck from "@iconify-icons/lucide/circle-check";
import clock3 from "@iconify-icons/lucide/clock-3";
import alertCircle from "@iconify-icons/lucide/alert-circle";
import refreshCw from "@iconify-icons/lucide/refresh-cw";
import shieldCheck from "@iconify-icons/lucide/shield-check";
import logOut from "@iconify-icons/lucide/log-out";
import menu from "@iconify-icons/lucide/menu";
import x from "@iconify-icons/lucide/x";
import pencil from "@iconify-icons/lucide/pencil";
import trash2 from "@iconify-icons/lucide/trash-2";
import eye from "@iconify-icons/lucide/eye";
import eyeOff from "@iconify-icons/lucide/eye-off";
import copy from "@iconify-icons/lucide/copy";
import loaderCircle from "@iconify-icons/lucide/loader-circle";
import fileSpreadsheet from "@iconify-icons/lucide/file-spreadsheet";
import moon from "@iconify-icons/lucide/moon";
import sun from "@iconify-icons/lucide/sun";
import sparkles from "@iconify-icons/lucide/sparkles";

import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";

import {
  kinds,
  names,
  sharingTypes,
  today,
  addDays,
  status,
  dueDate,
  todayBreakdown,
  cleanRecord,
  uniqueRows,
} from "../shared/domain.js";

import { configured, supabase, request, startDemo } from "./data.js";

import {
  AppIcon,
  Service,
  NetflixIcon,
  WeekIcon,
  DisneyIcon,
  CanvaIcon,
} from "./Visuals.jsx";

import LoginPage from "./components/LoginPage.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import WelcomeScreen from "./components/WelcomeScreen.jsx";
import Mascot from "./components/Mascot.jsx";

import {
  CanvaTable,
  CanvaAccountModal,
} from "./components/CanvaFeatures.jsx";

import {
  success,
  failure,
  confirm,
  toast,
} from "./dialogs.js";

import "./style.css";

// ==========================================
// HELPERS
// ==========================================

const I = ({ icon, size = 18, ...props }) => (
  <Icon
    icon={icon}
    width={size}
    height={size}
    {...props}
  />
);

const serviceIcons = {
  netflix: NetflixIcon,
  week: WeekIcon,
  disney: DisneyIcon,
  canva: CanvaIcon,
};

const identity = (r) =>
  r.kind === "disney" ? r.profil : r.email;

const dateLabel = (
  date,
  options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
) =>
  date
    ? new Intl.DateTimeFormat("id-ID", options).format(
        new Date(`${date}T00:00:00`),
      )
    : "Belum diatur";

// ==========================================
// REUSABLE UI
// ==========================================

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
    >
      <I icon={theme === "dark" ? sun : moon} />
      {theme === "dark" ? "Terang" : "Gelap"}
    </button>
  );
}

function Brand() {
  return (
    <div className="brand">
      <AppIcon alt="Logo Orinimo" />
      <div>
        <strong>
          orinimo<span>.</span>
        </strong>
        <small>ACCOUNT WORKSPACE</small>
      </div>
    </div>
  );
}

function StatusBadge({ record, date }) {
  const s = status(record, date);

  return (
    <span className={`badge ${s.tone}`}>
      <i />
      {s.label}
    </span>
  );
}

function Empty({
  title = "Tidak ada akun ditemukan",
  text = "Coba ubah pencarian atau tambahkan akun.",
}) {
  return (
    <div className="empty-state">
      <Mascot
        variant="calm"
        size={96}
        decorative
        className="mx-auto mb-3"
      />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

// ==========================================
// MAIN APP
// ==========================================

function App() {
  const reduceMotion = useReducedMotion();
  const lenisRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("orinimo-theme");

      if (stored === "light" || stored === "dark") {
        return stored;
      }

      return window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  const [session, setSession] = useState(null);
  const [demo, setDemo] = useState(false);
  const [authReady, setAuthReady] = useState(!configured);
  const [boot, setBoot] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);

  const toggleTheme = () => {
    setTheme((v) => (v === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    try {
      localStorage.setItem("orinimo-theme", theme);
    } catch {}
  }, [theme]);

  // Smooth scroll
  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  // Supabase authentication
  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted) setBoot(false);
    }, 700);

    if (!supabase) {
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;

        setSession(nextSession);
        setAuthReady(true);
      },
    );

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) console.error(error);

        setSession(data?.session ?? null);
        setAuthReady(true);
      })
      .catch((err) => {
        if (!mounted) return;

        console.error(err);
        setAuthReady(true);
      });

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const isWelcome = Boolean(
    welcomeUser &&
      session?.user?.id === welcomeUser.id,
  );

  const isWorkspace = Boolean(
    demo || (session && !signingIn),
  );

  const screenKey = isWelcome
    ? "welcome"
    : isWorkspace
      ? `workspace-${demo ? "demo" : session.user.id}`
      : "login";

  const scrollToTop = () =>
    lenisRef.current
      ? lenisRef.current.scrollTo(0, {
          duration: 0.65,
        })
      : window.scrollTo({
          top: 0,
          behavior: reduceMotion ? "auto" : "smooth",
        });

  if (boot || !authReady) {
    return (
      <LoadingScreen
        theme={theme}
        onThemeToggle={toggleTheme}
        text="Menyiapkan ruang kerjamu..."
      />
    );
  }

  const screen = isWelcome ? (
    <WelcomeScreen
      user={welcomeUser}
      onComplete={() => setWelcomeUser(null)}
      theme={theme}
      onThemeToggle={toggleTheme}
    />
  ) : isWorkspace ? (
    <Workspace
      key={demo ? "demo" : session.user.id}
      demo={demo}
      session={session}
      theme={theme}
      onThemeToggle={toggleTheme}
      scrollToTop={scrollToTop}
      onLogout={async () => {
        setWelcomeUser(null);

        if (demo) {
          setDemo(false);
          return;
        }

        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        setSession(null);
      }}
    />
  ) : (
    <LoginPage
      theme={theme}
      onThemeToggle={toggleTheme}
      onLoginStart={() => setSigningIn(true)}
      onSuccess={(nextSession) => {
        setSession(nextSession);
        setWelcomeUser(nextSession.user);
        setSigningIn(false);
      }}
      onLoginEnd={() => setSigningIn(false)}
      onDemo={() => {
        startDemo();
        setDemo(true);
      }}
    />
  );

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
    >
      <motion.div
        key={screenKey}
        className="screen-transition"
        initial={
          reduceMotion ? false : { opacity: 0 }
        }
        animate={{ opacity: 1 }}
        exit={{
          opacity: reduceMotion ? 1 : 0,
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.22,
        }}
      >
        {screen}
      </motion.div>
    </AnimatePresence>
  );
}

// ==========================================
// WORKSPACE
// ==========================================

function Workspace({
  demo,
  session,
  theme,
  onThemeToggle,
  scrollToTop,
  onLogout,
}) {
  const reduceMotion = useReducedMotion();

  const [view, setView] = useState("dashboard");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [remKind, setRemKind] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState(today());

  // ==========================================
  // DELETE ALL STATE
  // ==========================================

  const [deletingKind, setDeletingKind] = useState(null);

  const [deleteProgress, setDeleteProgress] = useState({
    done: 0,
    total: 0,
  });

  const deleteLock = useRef(false);

  const selectedKind = kinds.includes(view)
    ? view
    : "netflix";

  const categoryCount = rows.filter(
    (r) => r.kind === selectedKind,
  ).length;

  const title =
    view === "dashboard"
      ? "Dashboard"
      : view === "reminders"
        ? "Pusat reminder"
        : view === "settings"
          ? "Pengaturan"
          : `Rekapan ${names[view] || view}`;

  // ==========================================
  // LOAD DATA
  // ==========================================

  async function reload() {
    setLoading(true);
    setError("");

    try {
      setRows(await request("/accounts", {}, demo));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();

    const timer = setInterval(() => {
      setClock(today());
    }, 60000);

    return () => clearInterval(timer);
  }, [demo]);

  useEffect(() => {
    document.title = `Orinimo | ${title}`;
  }, [title]);

  const reminders = useMemo(
    () =>
      rows
        .filter((r) =>
          ["overdue", "today", "soon"].includes(
            status(r, clock).key,
          ),
        )
        .sort((a, b) =>
          (dueDate(a) || "").localeCompare(
            dueDate(b) || "",
          ),
        ),
    [rows, clock],
  );

  const totalToday = rows.filter(
    (r) => status(r, clock).key === "today",
  ).length;

  const todaySummary = todayBreakdown(rows, clock);

  // ==========================================
  // NAVIGATION
  // ==========================================

  function navigate(nextView, nextKind) {
    if (deleteLock.current) return;

    scrollToTop();
    setView(nextView);
    setQuery("");

    setFilter(
      nextView === "reminders" ? "today" : "all",
    );

    setPage(1);
    setMobile(false);

    if (nextKind) setRemKind(nextKind);
  }

  // ==========================================
  // CREATE / UPDATE ACCOUNT
  // ==========================================

  async function save(data, id) {
    if (deleteLock.current) return;

    setBusy(true);

    try {
      const result = await request(
        id ? `/accounts/${id}` : "/accounts",
        {
          method: id ? "PUT" : "POST",
          body: cleanRecord(data),
        },
        demo,
      );

      setRows((previous) =>
        id
          ? previous.map((record) =>
              record.id === id ? result : record,
            )
          : [result, ...previous],
      );

      setModal(null);

      await success(
        id
          ? "Perubahan tersimpan!"
          : "Akun berhasil ditambahkan!",
        `${names[data.kind]} sudah diperbarui. Reminder otomatis menyesuaikan.`,
      );
    } catch (err) {
      await failure(err);
    } finally {
      setBusy(false);
    }
  }

  // ==========================================
  // DELETE SINGLE ACCOUNT
  // ==========================================

  async function remove(record) {
    if (deleteLock.current) return;

    const answer = await confirm(
      "Hapus akun ini?",
      `${identity(record)} akan dihapus dari rekapan dan reminder.`,
      "Ya, hapus akun",
    );

    if (!answer.isConfirmed) return;

    try {
      await request(
        `/accounts/${record.id}`,
        { method: "DELETE" },
        demo,
      );

      setRows((previous) =>
        previous.filter(
          (item) => item.id !== record.id,
        ),
      );

      await success(
        "Akun berhasil dihapus",
        "Rekapan dan reminder telah diperbarui.",
      );
    } catch (err) {
      await failure(err);
    }
  }

  // ==========================================
  // DELETE ALL ACCOUNTS IN ONE CATEGORY
  // ==========================================

  async function removeAll(kind) {
    if (
      deleteLock.current ||
      !kinds.includes(kind)
    ) {
      return;
    }

    deleteLock.current = true;

    // Hanya ambil record dari kategori yang dipilih.
    // Tidak terpengaruh filter, pencarian, atau pagination.
    const targets = rows.filter(
      (record) => record.kind === kind,
    );

    const label = names[kind];

    let deleted = 0;
    let stoppedBy = null;

    try {
      if (!targets.length) return;

      // Konfirmasi pertama
      const first = await confirm(
        `Hapus semua akun ${label}?`,
        `${targets.length} akun ${label} akan dihapus permanen, termasuk yang tersembunyi oleh pencarian atau filter. Kategori lain tetap aman.`,
        "Lanjutkan",
      );

      if (!first.isConfirmed) return;

      // Konfirmasi kedua
      const second = await confirm(
        "Konfirmasi terakhir",
        `Kamu akan menghapus permanen ${targets.length} akun dari kategori ${label}. Tindakan ini tidak bisa dibatalkan.`,
        `Hapus ${targets.length} akun`,
      );

      if (!second.isConfirmed) return;

      setDeletingKind(kind);

      setDeleteProgress({
        done: 0,
        total: targets.length,
      });

      // Menggunakan API DELETE yang sudah tersedia.
      // Tidak perlu endpoint baru atau migrasi Supabase.
      for (const record of targets) {
        try {
          await request(
            `/accounts/${record.id}`,
            { method: "DELETE" },
            demo,
          );

          deleted += 1;

          setRows((previous) =>
            previous.filter(
              (item) => item.id !== record.id,
            ),
          );

          setDeleteProgress({
            done: deleted,
            total: targets.length,
          });
        } catch (err) {
          stoppedBy = err;

          // Berhenti pada error pertama.
          // Mencegah permintaan gagal berulang kali.
          break;
        }
      }

      // Sinkronkan jumlah akun dengan backend.
      await reload();

      if (stoppedBy) {
        await failure(
          new Error(
            `${deleted} dari ${targets.length} akun ${label} berhasil dihapus. Proses terhenti: ${stoppedBy.message}. Periksa akun yang tersisa sebelum mengulangi.`,
          ),
        );
      } else {
        await success(
          "Hapus semua berhasil!",
          `${deleted} akun ${label} berhasil dihapus. Kategori lainnya tidak berubah.`,
        );
      }
    } catch (err) {
      await failure(err);
    } finally {
      setDeletingKind(null);

      setDeleteProgress({
        done: 0,
        total: 0,
      });

      deleteLock.current = false;
    }
  }

  // ==========================================
  // EXPORT EXCEL
  // ==========================================

  async function exportRows(kind, template = false) {
    if (deleteLock.current) return;

    try {
      if (
        !template &&
        ["netflix", "week"].includes(kind)
      ) {
        const answer = await confirm(
          "Ekspor data akun?",
          "Excel memuat password. Simpan file dengan aman.",
          "Ekspor Excel",
        );

        if (!answer.isConfirmed) return;
      }

      const { writeWorkbook } = await import(
        "../shared/excel.js"
      );

      const bytes = await writeWorkbook(
        rows.filter((r) => r.kind === kind),
        kind,
        template,
      );

      const url = URL.createObjectURL(
        new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );

      const link = document.createElement("a");

      link.href = url;

      link.download =
        `${template ? "template-" : ""}rekapan-${kind}-${today()}.xlsx`;

      link.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      toast(
        template
          ? "Template siap diunduh"
          : "Excel siap diunduh",
      );
    } catch (err) {
      await failure(err);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async function logout() {
    if (deleteLock.current) return;

    const answer = await confirm(
      "Keluar dari workspace?",
      demo
        ? "Perubahan data demo akan hilang."
        : "Sesi admin akan diakhiri.",
      "Keluar",
    );

    if (!answer.isConfirmed) return;

    try {
      await onLogout();
    } catch (err) {
      await failure(err);
    }
  }

  // ==========================================
  // FILTER, SORT, PAGINATION
  // ==========================================

  const listing = rows
    .filter((record) =>
      view === "reminders"
        ? (remKind === "all" ||
            record.kind === remKind) &&
          ["overdue", "today", "soon"].includes(
            status(record, clock).key,
          )
        : record.kind === view,
    )
    .filter(
      (record) =>
        (filter === "all" ||
          status(record, clock).key === filter) &&
        [
          record.email,
          record.profil,
          record.nomor,
          record.device,
          record.lokasi,
          record.tipe_sharing,
          record.deskripsi,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    )
    .sort((a, b) =>
      sort === "due"
        ? (dueDate(a) || "9999").localeCompare(
            dueDate(b) || "9999",
          )
        : sort === "name"
          ? String(identity(a) || "").localeCompare(
              String(identity(b) || ""),
            )
          : String(b.created_at || "").localeCompare(
              String(a.created_at || ""),
            ),
    );

  const pages = Math.max(
    1,
    Math.ceil(listing.length / 8),
  );

  const safePage = Math.min(page, pages);

  const pageRows = listing.slice(
    (safePage - 1) * 8,
    safePage * 8,
  );

  const nav = (
    key,
    label,
    IconComponent,
    count = 0,
  ) => (
    <button
      key={key}
      type="button"
      disabled={Boolean(deletingKind)}
      className={`nav-link ${
        view === key ? "active" : ""
      }`}
      onClick={() => navigate(key)}
    >
      <IconComponent
        size={
          ["netflix", "week", "disney", "canva"].includes(key)
            ? 28
            : 19
        }
      />

      <span>{label}</span>

      {count > 0 && <b>{count}</b>}
    </button>
  );

  // ==========================================
  // RENDER WORKSPACE
  // ==========================================

  return (
    <div className="app-shell">

      {/* MOBILE OVERLAY */}
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="Tutup menu"
          onClick={() => setMobile(false)}
        />
      )}

      {/* ======================================
          SIDEBAR
          ====================================== */}

      <aside
        className={`sidebar ${
          mobile ? "open" : ""
        }`}
      >
        <Brand />

        <span className="nav-label">
          WORKSPACE
        </span>

        <nav>
          {nav(
            "dashboard",
            "Dashboard",
            () => <I icon={dashboardIcon} />,
          )}

          <span className="nav-label inner">
            KELOLA AKUN
          </span>

          {nav("netflix", "Netflix", NetflixIcon)}
          {nav("week", "Netflix 1 Week", WeekIcon)}
          {nav("disney", "Disney+", DisneyIcon)}
          {nav("canva", "Canva", CanvaIcon)}

          <span className="nav-label inner">
            MONITORING
          </span>

          {nav(
            "reminders",
            "Reminder",
            () => <I icon={bell} />,
            reminders.length,
          )}

          {nav(
            "settings",
            "Pengaturan",
            () => <I icon={settingsIcon} />,
          )}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="user-card"
            onClick={logout}
            disabled={Boolean(deletingKind)}
          >
            <span className="user-avatar">
              {demo
                ? "D"
                : (
                    session?.user.email || "A"
                  )[0].toUpperCase()}
            </span>

            <span>
              <strong>
                {demo
                  ? "Demo Admin"
                  : session?.user.email?.split("@")[0]}
              </strong>

              <small>
                {demo
                  ? "Mode demo"
                  : session?.user.app_metadata?.role === "admin"
                    ? "Administrator"
                    : "Pengguna"}
              </small>
            </span>

            <I icon={logOut} />
          </button>
        </div>
      </aside>

      {/* ======================================
          MAIN
          ====================================== */}

      <div className="main-shell">

        {/* TOPBAR */}
        <header className="topbar">
          <div>
            <button
              className="icon-btn mobile-menu"
              onClick={() => setMobile(true)}
              aria-label="Buka menu"
            >
              <I icon={menu} size={22} />
            </button>

            <span className="breadcrumb">
              Workspace
              <I icon={chevronRight} size={14} />
              <strong>{title}</strong>
            </span>
          </div>

          <div className="topbar-right">
            <ThemeToggle
              theme={theme}
              onToggle={onThemeToggle}
            />

            {demo ? (
              <span className="demo-pill">
                Mode demo
              </span>
            ) : (
              <span className="connection">
                <i /> Workspace aktif
              </span>
            )}

            <button
              className="icon-btn notification"
              aria-label="Lihat reminder"
              disabled={Boolean(deletingKind)}
              onClick={() => navigate("reminders")}
            >
              <I icon={bell} size={20} />
              {reminders.length > 0 && <i />}
            </button>

            <span className="top-avatar">
              {demo
                ? "D"
                : (
                    session?.user.email || "A"
                  )[0].toUpperCase()}
            </span>
          </div>
        </header>

        <AnimatePresence
          mode="wait"
          initial={false}
        >
          <motion.main
            key={view}
            className="main-content"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 10 }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: reduceMotion ? 1 : 0,
              y: reduceMotion ? 0 : -5,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.28,
            }}
          >

            {/* PAGE HEADING */}
            <div className="page-heading">
              <div>
                <span className="eyebrow">
                  {view === "dashboard"
                    ? "YOUR WORKSPACE, AT A GLANCE"
                    : view === "reminders"
                      ? "STAY ONE STEP AHEAD"
                      : "ACCOUNT MANAGEMENT"}
                </span>

                <h1>
                  {view === "dashboard"
                    ? "Overview"
                    : title}

                  <span className="heading-dot">
                    .
                  </span>
                </h1>

                <p>
                  {view === "dashboard"
                    ? "Selamat datang kembali. Semua akunmu, dalam kendali."
                    : view === "reminders"
                      ? "Satu tempat untuk semua jadwal reset dan masa aktif."
                      : view === "settings"
                        ? "Preferensi dan informasi workspace."
                        : `Kelola dan perbarui akun ${names[view]} dengan mudah.`}
                </p>
              </div>

              {/* PAGE ACTIONS */}
              <div className="heading-actions">

                {view === "dashboard" ? (
                  <span className="date-chip">
                    <I icon={calendarIcon} />

                    {dateLabel(clock, {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                ) : kinds.includes(view) ? (
                  <>

                    {/* EXPORT */}
                    <button
                      type="button"
                      className="btn secondary"
                      disabled={Boolean(deletingKind)}
                      onClick={() =>
                        exportRows(selectedKind)
                      }
                    >
                      <I icon={download} />
                      Ekspor Excel
                    </button>

                    {/* DELETE ALL */}
                    <button
                      type="button"
                      className="btn secondary"
                      disabled={
                        Boolean(deletingKind) ||
                        categoryCount === 0
                      }
                      onClick={() =>
                        removeAll(selectedKind)
                      }
                      style={{
                        borderColor: "#f0c9c6",
                        color: "#ad3d37",
                      }}
                    >
                      <I
                        icon={
                          deletingKind
                            ? loaderCircle
                            : trash2
                        }
                      />

                      {deletingKind
                        ? `Menghapus ${deleteProgress.done}/${deleteProgress.total}`
                        : `Hapus Semua (${categoryCount})`}
                    </button>

                    {/* ADD ACCOUNT */}
                    <button
                      type="button"
                      className="btn primary"
                      disabled={Boolean(deletingKind)}
                      onClick={() =>
                        setModal({
                          kind: selectedKind,
                        })
                      }
                    >
                      <I icon={plus} />
                      Tambah akun
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {/* DELETE ALL PROGRESS */}
            {deletingKind && (
              <div
                role="status"
                aria-live="polite"
                className="mb-4 rounded-xl border border-[#efd3c9] bg-[#fff5f0] px-4 py-3 text-xs text-[#92433c] dark:border-[#734943] dark:bg-[#352526] dark:text-[#f2c8c0]"
              >
                Sedang menghapus akun {names[deletingKind]}:
                {" "}
                {deleteProgress.done} dari {deleteProgress.total}.
                Jangan tutup halaman sampai selesai.
              </div>
            )}

            {/* ==================================
                CONTENT
                ================================== */}

            {error ? (
              <div className="error-state">
                <I icon={alertCircle} size={28} />

                <h3>
                  Data belum dapat dimuat
                </h3>

                <p>{error}</p>

                <button
                  className="btn primary"
                  onClick={reload}
                >
                  <I icon={refreshCw} />
                  Coba lagi
                </button>
              </div>
            ) : loading ? (
              <div className="skeleton-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="skeleton"
                  />
                ))}

                <div className="skeleton full" />
              </div>
            ) : view === "dashboard" ? (
              <Dashboard
                rows={rows}
                reminders={reminders}
                totalToday={totalToday}
                date={clock}
                navigate={navigate}
                setModal={setModal}
              />
            ) : view === "settings" ? (
              <Settings
                demo={demo}
                email={session?.user.email}
                theme={theme}
                onThemeToggle={onThemeToggle}
              />
            ) : (
              <>

                {/* CATEGORY STATS */}
                {kinds.includes(view) && (
                  <div className="mini-stats">
                    <div>
                      <span>Total akun</span>

                      <strong>
                        {categoryCount}
                        <small>akun</small>
                      </strong>
                    </div>

                    <div>
                      <span>Aktif</span>

                      <strong className="green-text">
                        {rows.filter(
                          (r) =>
                            r.kind === view &&
                            status(r, clock).key === "active",
                        ).length}

                        <small>akun</small>
                      </strong>
                    </div>

                    <div>
                      <span>Perlu perhatian</span>

                      <strong className="brand-text">
                        {reminders.filter(
                          (r) => r.kind === view,
                        ).length}

                        <small>akun</small>
                      </strong>
                    </div>
                  </div>
                )}

                {/* REMINDERS */}
                {view === "reminders" && (
                  <>
                    <div className="reminder-intro">
                      <span className="reminder-symbol">
                        <I icon={bell} size={24} />
                      </span>

                      <div>
                        <h3>
                          {totalToday
                            ? `${totalToday} akun perlu ditangani hari ini`
                            : "Pantau jadwal berikutnya"}
                        </h3>

                        <p>
                          Netflix, Disney+ & Canva: H−3 ·
                          Netflix mingguan: H−2 · Zona waktu WITA
                        </p>

                        {!!todaySummary.length && (
                          <ul className="reminder-breakdown">
                            {todaySummary.map((item) => (
                              <li
                                key={`${item.kind}:${item.sharing}`}
                              >
                                <span
                                  className={`breakdown-dot ${item.kind}`}
                                />

                                <strong>
                                  {item.count} akun
                                </strong>

                                <span>
                                  {item.kind === "netflix"
                                    ? `Netflix · ${item.sharing}`
                                    : names[item.kind]}
                                </span>

                                <span>
                                  jatuh tempo hari ini
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="tabs service-tabs">
                      {["all", ...kinds].map((kind) => (
                        <button
                          key={kind}
                          className={
                            remKind === kind ? "selected" : ""
                          }
                          onClick={() => {
                            setRemKind(kind);
                            setPage(1);
                          }}
                        >
                          {kind === "all"
                            ? "Semua layanan"
                            : names[kind]}

                          <span>
                            {reminders.filter(
                              (record) =>
                                kind === "all" ||
                                record.kind === kind,
                            ).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* TABLE PANEL */}
                <section className="panel records-panel">

                  <div className="panel-heading">
                    <div>
                      <h2>
                        {view === "reminders"
                          ? "Jadwal yang perlu diperhatikan"
                          : "Daftar akun"}
                        {" "}
                        <span className="count-tag">
                          {listing.length}
                        </span>
                      </h2>

                      <p>
                        {view === "canva"
                          ? "Email, tanggal pembelian, masa aktif, dan akses Designer Canva."
                          : view === "reminders"
                            ? "Perbarui tanggal untuk menjadwalkan pengingat berikutnya."
                            : "Semua informasi akun tersimpan di satu tempat."}
                      </p>
                    </div>

                    {kinds.includes(view) && (
                      <button
                        type="button"
                        className="btn secondary small"
                        disabled={Boolean(deletingKind)}
                        onClick={() =>
                          setImportOpen(true)
                        }
                      >
                        <I icon={upload} size={15} />
                        Impor Excel
                      </button>
                    )}
                  </div>

                  {/* TABLE TOOLS */}
                  <div className="table-toolbar">

                    <div className="search-field">
                      <I icon={search} />

                      <input
                        aria-label="Cari akun"
                        value={query}
                        placeholder="Cari akun, profil, atau catatan…"
                        onChange={(event) => {
                          setQuery(event.target.value);
                          setPage(1);
                        }}
                      />

                      {query && (
                        <button
                          className="icon-btn"
                          onClick={() => setQuery("")}
                          aria-label="Hapus pencarian"
                        >
                          <I icon={x} size={14} />
                        </button>
                      )}
                    </div>

                    <div className="toolbar-select">
                      <I
                        icon={sliders}
                        size={15}
                      />

                      <select
                        aria-label="Filter status"
                        value={filter}
                        onChange={(event) => {
                          setFilter(event.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="all">
                          Semua status
                        </option>

                        <option value="today">
                          Hari ini
                        </option>

                        <option value="soon">
                          Segera
                        </option>

                        <option value="overdue">
                          Terlewat
                        </option>

                        {view !== "reminders" && (
                          <>
                            <option value="active">
                              Aktif
                            </option>

                            <option value="unset">
                              Belum diatur
                            </option>
                          </>
                        )}
                      </select>
                    </div>

                    <select
                      aria-label="Urutkan akun"
                      className="sort-select"
                      value={sort}
                      onChange={(event) =>
                        setSort(event.target.value)
                      }
                    >
                      <option value="newest">
                        Terbaru
                      </option>

                      <option value="due">
                        Tanggal terdekat
                      </option>

                      <option value="name">
                        Nama A–Z
                      </option>
                    </select>
                  </div>

                  {/* CANVA / NORMAL TABLE */}
                  {view === "canva" ? (
                    <CanvaTable
                      records={pageRows}
                      date={clock}
                      offset={(safePage - 1) * 8}
                      onEdit={setModal}
                      onDelete={remove}
                    />
                  ) : (
                    <AccountTable
                      records={pageRows}
                      view={view}
                      date={clock}
                      offset={(safePage - 1) * 8}
                      onEdit={setModal}
                      onDelete={remove}
                    />
                  )}

                  {/* PAGINATION */}
                  <div className="pagination">
                    <span>
                      Menampilkan
                      {" "}
                      <b>
                        {listing.length
                          ? (safePage - 1) * 8 + 1
                          : 0}
                        –
                        {Math.min(
                          safePage * 8,
                          listing.length,
                        )}
                      </b>
                      {" "}
                      dari <b>{listing.length}</b> akun
                    </span>

                    <div>
                      <button
                        className="icon-btn"
                        aria-label="Sebelumnya"
                        disabled={safePage === 1}
                        onClick={() =>
                          setPage(safePage - 1)
                        }
                      >
                        <I icon={chevronLeft} />
                      </button>

                      <span className="page-current">
                        {safePage}
                      </span>

                      <span className="page-of">
                        / {pages}
                      </span>

                      <button
                        className="icon-btn"
                        aria-label="Berikutnya"
                        disabled={safePage === pages}
                        onClick={() =>
                          setPage(safePage + 1)
                        }
                      >
                        <I icon={chevronRight} />
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* FOOTER */}
            <footer className="page-footer">
              <span>
                © {new Date().getFullYear()} Orinimo ·
                Made for a simpler workflow.
              </span>

              <span>
                <I icon={shieldCheck} size={13} />

                {demo
                  ? "Data demo tidak tersimpan"
                  : "Akses admin terlindungi"}
              </span>
            </footer>
          </motion.main>
        </AnimatePresence>
      </div>

      {/* ACCOUNT MODALS */}
      {modal &&
        (modal.kind === "canva" ? (
          <CanvaAccountModal
            record={modal}
            busy={busy}
            onClose={() =>
              !busy && setModal(null)
            }
            onSave={save}
          />
        ) : (
          <AccountModal
            record={modal}
            busy={busy}
            onClose={() =>
              !busy && setModal(null)
            }
            onSave={save}
          />
        ))}

      {/* IMPORT MODAL */}
      {importOpen && (
        <ImportModal
          kind={selectedKind}
          demo={demo}
          existing={rows}
          onClose={() => setImportOpen(false)}
          onDone={async () => {
            setImportOpen(false);
            await reload();
          }}
          onTemplate={() =>
            exportRows(selectedKind, true)
          }
        />
      )}
    </div>
  );
}

// ==========================================
// DASHBOARD
// ==========================================

function Dashboard({
  rows,
  reminders,
  totalToday,
  date,
  navigate,
  setModal,
}) {
  const active = rows.filter(
    (r) => status(r, date).key === "active",
  ).length;

  const soon = reminders.filter(
    (r) => status(r, date).key === "soon",
  ).length;

  const overdue = reminders.filter(
    (r) => status(r, date).key === "overdue",
  ).length;

  const stats = [
    [
      "Total akun",
      rows.length,
      "di seluruh layanan",
      clapperboard,
      "red",
    ],
    [
      "Akun aktif",
      active,
      "masa aktif masih aman",
      shieldCheck,
      "green",
    ],
    [
      "Jadwal hari ini",
      totalToday,
      "siap untuk diperbarui",
      calendarIcon,
      "orange",
    ],
    [
      "Segera berakhir",
      soon,
      "dalam 2–3 hari",
      clock3,
      "purple",
    ],
  ];

  return (
    <>
      {/* STATS */}
      <div className="stats-grid">
        {stats.map(
          (
            [
              name,
              value,
              subtitle,
              iconData,
              tone,
            ],
            i,
          ) => (
            <div
              key={name}
              className="stat-card"
              style={{
                animationDelay: `${i * 55}ms`,
              }}
            >
              <div className="stat-top">
                <span>{name}</span>

                <span className={`stat-icon ${tone}`}>
                  <I icon={iconData} />
                </span>
              </div>

              <strong>
                {String(value).padStart(2, "0")}
              </strong>

              <div className="stat-bottom">
                <span>{subtitle}</span>
                <I icon={arrowUpRight} size={15} />
              </div>
            </div>
          ),
        )}
      </div>

      {/* DASHBOARD MIDDLE */}
      <div className="dashboard-middle">
        <section className="welcome-card">

          <span className="eyebrow">
            LESS MANAGING. MORE LIVING.
          </span>

          <h2>
            Rapi akunnya.
            <br />
            Tenang harinya.
          </h2>

          <p>
            Kelola semua langganan tanpa kehilangan
            jadwal penting.
          </p>

          <button
            className="btn light"
            onClick={() =>
              setModal({
                kind: "netflix",
              })
            }
          >
            <I icon={plus} />
            Tambah akun baru
            <I icon={arrowUpRight} />
          </button>

          <div
            className="hero-art"
            aria-hidden="true"
          >
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />

            <div className="floating-card behind">
              <I icon={calendarIcon} size={23} />
              <div />
              <div />
            </div>

            <div className="floating-card front">
              <span className="check-circle">
                <I icon={check} size={27} />
              </span>

              <b>
                All under control.
              </b>

              <small>
                A little more organized.
              </small>

              <div className="art-line" />
              <div className="art-line short" />

              <div className="art-avatars">
                <Service kind="netflix" />
                <Service kind="disney" />
                <Service kind="canva" />
              </div>
            </div>

            <I
              icon={sparkles}
              size={26}
              className="art-spark"
            />
          </div>
        </section>

        {/* SERVICES */}
        <section className="panel portfolio">

          <div className="panel-heading">
            <h2>
              Ringkasan layanan
            </h2>

            <I icon={clapperboard} />
          </div>

          <p className="portfolio-sub">
            Semua langganan dalam satu pandangan.
          </p>

          {kinds.map((kind) => (
            <button
              key={kind}
              className="service-row"
              onClick={() => navigate(kind)}
            >
              <Service kind={kind} />

              <span>
                <strong>
                  {names[kind]}
                </strong>

                <small>
                  {kind === "netflix"
                    ? "Akun bulanan"
                    : kind === "week"
                      ? "Paket mingguan"
                      : kind === "disney"
                        ? "Profil & perangkat"
                        : "Masa aktif dan Designer"}
                </small>
              </span>

              <b>
                {rows.filter(
                  (r) => r.kind === kind,
                ).length}
              </b>

              <I icon={chevronRight} size={16} />
            </button>
          ))}

          <div className="portfolio-total">
            <span>
              Total seluruh layanan
            </span>

            <strong>
              {rows.length} akun
            </strong>
          </div>
        </section>
      </div>

      {/* DASHBOARD BOTTOM */}
      <div className="dashboard-bottom">

        {/* REMINDERS */}
        <section className="panel reminder-panel">

          <div className="panel-heading">
            <div>
              <h2>
                Perlu perhatian
                {" "}
                <span className="count-tag">
                  {reminders.length}
                </span>
              </h2>

              <p>
                Jadwal terdekat, jangan sampai terlewat.
              </p>
            </div>

            <button
              className="text-btn"
              onClick={() =>
                navigate("reminders")
              }
            >
              Lihat semua
              <I icon={arrowUpRight} size={15} />
            </button>
          </div>

          {reminders.length ? (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>AKUN / PROFIL</th>
                    <th>JADWAL</th>
                    <th>STATUS</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {reminders
                    .slice(0, 4)
                    .map((record) => (
                      <tr key={record.id}>
                        <td>
                          <div className="account-cell">
                            <Service kind={record.kind} />

                            <span>
                              <strong>
                                {identity(record)}
                              </strong>

                              <small>
                                {names[record.kind]}
                              </small>
                            </span>
                          </div>
                        </td>

                        <td>
                          {dateLabel(
                            dueDate(record),
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}
                        </td>

                        <td>
                          <StatusBadge
                            record={record}
                            date={date}
                          />
                        </td>

                        <td>
                          <button
                            className="icon-btn"
                            onClick={() =>
                              setModal(record)
                            }
                            aria-label={`Edit ${identity(record)}`}
                          >
                            <I icon={arrowUpRight} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="Semua jadwal aman"
              text="Belum ada akun mendekati jatuh tempo."
            />
          )}
        </section>

        {/* QUICK ACCESS */}
        <section className="panel quick-panel">

          <div className="panel-heading">
            <h2>Akses cepat</h2>
            <I icon={sparkles} />
          </div>

          <p>
            Lebih sedikit klik, lebih banyak beres.
          </p>

          {kinds.map((kind) => {
            const ServiceIcon = serviceIcons[kind];

            return (
              <button
                className="quick-link"
                key={kind}
                onClick={() =>
                  setModal({ kind })
                }
              >
                <span className="quick-icon">
                  <ServiceIcon size={28} />
                </span>

                <span>
                  <strong>
                    Tambah {names[kind]}
                  </strong>

                  <small>
                    {kind === "disney"
                      ? "Catat profil"
                      : kind === "canva"
                        ? "Catat masa aktif Canva"
                        : "Simpan akun baru"}
                  </small>
                </span>

                <I icon={plus} />
              </button>
            );
          })}

          <div
            className={`quick-notice ${
              overdue ? "attention" : ""
            }`}
          >
            <span className="notice-icon">
              <I
                icon={
                  overdue ? alertCircle : circleCheck
                }
              />
            </span>

            <p>
              {overdue
                ? `${overdue} akun melewati jadwal. Yuk, perbarui tanggalnya.`
                : "Reminder mengikuti tanggal akun otomatis."}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

// ==========================================
// PASSWORD DISPLAY
// ==========================================

function Password({ value = "" }) {
  const [show, setShow] = useState(false);

  return (
    <span className="password-cell">
      <code>
        {show ? value : "••••••••"}
      </code>

      <button
        className="icon-btn"
        aria-label={
          show
            ? "Sembunyikan password"
            : "Tampilkan password"
        }
        onClick={() =>
          setShow(!show)
        }
      >
        <I
          icon={show ? eyeOff : eye}
          size={15}
        />
      </button>

      <button
        className="icon-btn"
        aria-label="Salin password"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            toast("Password disalin");
          } catch {
            await failure(
              new Error("Clipboard tidak tersedia."),
            );
          }
        }}
      >
        <I icon={copy} size={14} />
      </button>
    </span>
  );
}

// ==========================================
// ACCOUNT TABLE
// ==========================================

function AccountTable({
  records,
  view,
  date,
  offset,
  onEdit,
  onDelete,
}) {
  if (!records.length) return <Empty />;

  const disney = view === "disney";
  const rem = view === "reminders";
  const week = view === "week";

  return (
    <div className="table-scroll">
      <table className="account-table">

        <thead>
          <tr>
            <th>
              {disney ? "NOMOR" : "NO."}
            </th>

            <th>
              {disney ? "PROFIL" : "AKUN / PROFIL"}
            </th>

            {disney ? (
              <>
                <th>DEVICE</th>
                <th>LOKASI</th>
              </>
            ) : rem ? (
              <th>
                LAYANAN / TIPE SHARING
              </th>
            ) : (
              <th>PASSWORD</th>
            )}

            {week || disney ? (
              <th>TERJUAL</th>
            ) : !rem ? (
              <th>TIPE SHARING</th>
            ) : null}

            <th>
              {rem
                ? "JADWAL"
                : week
                  ? "TANGGAL HABIS"
                  : "TANGGAL RESET"}
            </th>

            {disney && (
              <th>DURASI</th>
            )}

            <th>STATUS</th>
            <th>AKSI</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record, i) => (
            <tr key={record.id}>

              <td className="row-number">
                {disney
                  ? record.nomor
                  : String(
                      offset + i + 1,
                    ).padStart(2, "0")}
              </td>

              <td>
                <div className="account-cell">
                  {!disney && (
                    <Service kind={record.kind} />
                  )}

                  <span>
                    <strong>
                      {identity(record)}
                    </strong>

                    <small>
                      {record.deskripsi ||
                        names[record.kind]}
                    </small>
                  </span>
                </div>
              </td>

              {disney ? (
                <>
                  <td>{record.device}</td>
                  <td>{record.lokasi}</td>
                </>
              ) : rem ? (
                <td>
                  <span className="reminder-type">
                    <strong>
                      {names[record.kind]}
                    </strong>

                    <small>
                      {record.kind === "netflix"
                        ? record.tipe_sharing
                        : record.kind === "canva"
                          ? "Masa aktif Canva"
                          : "Jadwal akun"}
                    </small>
                  </span>
                </td>
              ) : (
                <td>
                  <Password
                    value={record.password || ""}
                  />
                </td>
              )}

              {week || disney ? (
                <td className="date-cell">
                  {dateLabel(record.tanggal_terjual)}
                </td>
              ) : !rem ? (
                <td>
                  <span className="sharing-tag">
                    {record.tipe_sharing || "–"}
                  </span>
                </td>
              ) : null}

              <td className="date-cell">
                {dateLabel(dueDate(record))}

                {rem && (
                  <small className="remaining">
                    {status(record, date).days < 0
                      ? `${Math.abs(
                          status(record, date).days,
                        )} hari terlewat`
                      : status(record, date).days === 0
                        ? "Hari ini"
                        : `${
                            status(record, date).days
                          } hari lagi`}
                  </small>
                )}
              </td>

              {disney && (
                <td>
                  {record.durasi} hari
                </td>
              )}

              <td>
                <StatusBadge
                  record={record}
                  date={date}
                />
              </td>

              <td>
                <div className="row-actions">
                  <button
                    className="icon-btn"
                    onClick={() =>
                      onEdit(record)
                    }
                    aria-label={`Edit ${identity(record)}`}
                  >
                    <I icon={pencil} />
                  </button>

                  <button
                    className="icon-btn delete"
                    onClick={() =>
                      onDelete(record)
                    }
                    aria-label={`Hapus ${identity(record)}`}
                  >
                    <I icon={trash2} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// MODAL FRAME
// ==========================================

function ModalFrame({
  title,
  subtitle,
  busy,
  onClose,
  children,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    ref.current
      ?.querySelector("input,select,button")
      ?.focus();

    const keyHandler = (event) => {
      if (
        document.querySelector(".swal2-container")
      ) {
        return;
      }

      if (
        event.key === "Escape" &&
        !busy
      ) {
        onClose();
      }

      if (event.key !== "Tab") return;

      const elements = Array.from(
        ref.current?.querySelectorAll(
          "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)",
        ) || [],
      ).filter(
        (element) => element.offsetParent !== null,
      );

      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener(
      "keydown",
      keyHandler,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        keyHandler,
      );

      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [busy, onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !busy
        ) {
          onClose();
        }
      }}
    >
      <section
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-lenis-prevent
      >

        <div className="modal-heading">
          <div>
            <span className="eyebrow">
              ORINIMO WORKSPACE
            </span>

            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            disabled={busy}
            aria-label="Tutup dialog"
          >
            <I icon={x} size={21} />
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

// ==========================================
// NETFLIX / DISNEY ACCOUNT MODAL
// ==========================================

function AccountModal({
  record,
  busy,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    tipe_sharing: sharingTypes[0],
    deskripsi: "",
    nomor: "",
    profil: "",
    device: "",
    lokasi: "",
    tanggal_terjual: today(),
    tanggal_reset: addDays(today(), 30),
    durasi_habis: addDays(today(), 7),
    durasi: 30,
    ...record,
  });

  const [show, setShow] = useState(false);
  const [auto, setAuto] = useState(!record.id);
  const [formError, setFormError] = useState("");

  const disney = form.kind === "disney";
  const week = form.kind === "week";

  function update(key, value) {
    setForm((previous) => {
      const next = {
        ...previous,
        [key]: value,
      };

      if (
        auto &&
        disney &&
        ["tanggal_terjual", "durasi"].includes(key)
      ) {
        next.tanggal_reset = addDays(
          next.tanggal_terjual,
          Number(next.durasi),
        );
      }

      if (
        auto &&
        week &&
        key === "tanggal_terjual"
      ) {
        next.durasi_habis = addDays(value, 7);
      }

      return next;
    });
  }

  const field = (
    key,
    title,
    type = "text",
    required = false,
  ) => (
    <label key={key}>
      {title}

      {required && (
        <span className="required"> *</span>
      )}

      <input
        type={type}
        value={form[key] ?? ""}
        required={required}
        min={type === "number" ? 1 : undefined}
        max={type === "number" ? 3650 : undefined}
        onChange={(event) =>
          update(key, event.target.value)
        }
      />
    </label>
  );

  function submit(event) {
    event.preventDefault();

    try {
      const data = cleanRecord(form);

      setFormError("");

      onSave(data, record.id);
    } catch (err) {
      setFormError(
        err.issues
          ?.map((issue) => issue.message)
          .join(" ") || err.message,
      );
    }
  }

  return (
    <ModalFrame
      title={`${
        record.id ? "Edit" : "Tambah"
      } akun ${names[form.kind]}`}
      subtitle="Lengkapi informasi akun. Reminder menyesuaikan tanggal yang diatur."
      busy={busy}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="modal-body">

          <div className="form-grid">
            {disney ? (
              <>
                {field(
                  "nomor",
                  "Nomor",
                  "text",
                  true,
                )}

                {field(
                  "profil",
                  "Profil",
                  "text",
                  true,
                )}

                {field(
                  "device",
                  "Device",
                  "text",
                  true,
                )}

                {field(
                  "lokasi",
                  "Lokasi",
                  "text",
                  true,
                )}
              </>
            ) : (
              <>
                <div className="span-two">
                  {field(
                    "email",
                    "Email akun",
                    "email",
                    true,
                  )}
                </div>

                <label className="span-two">
                  Password akun
                  <span className="required"> *</span>

                  <div className="input-icon password-input">
                    <input
                      type={
                        show
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={(event) =>
                        update(
                          "password",
                          event.target.value,
                        )
                      }
                      required
                      autoComplete="off"
                    />

                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() =>
                        setShow(!show)
                      }
                      aria-label="Lihat password"
                    >
                      <I
                        icon={
                          show ? eyeOff : eye
                        }
                      />
                    </button>
                  </div>
                </label>
              </>
            )}

            {(disney || week) && (
              <>
                {field(
                  "tanggal_terjual",
                  "Tanggal terjual",
                  "date",
                  disney,
                )}

                {disney
                  ? field(
                      "durasi",
                      "Durasi (hari)",
                      "number",
                      true,
                    )
                  : field(
                      "durasi_habis",
                      "Tanggal habis",
                      "date",
                    )}
              </>
            )}

            {!week &&
              field(
                "tanggal_reset",
                "Tanggal reset",
                "date",
                disney,
              )}

            {!disney && !week && (
              <label>
                Tipe sharing
                <span className="required"> *</span>

                <select
                  value={form.tipe_sharing}
                  onChange={(event) =>
                    update(
                      "tipe_sharing",
                      event.target.value,
                    )
                  }
                >
                  {sharingTypes.map((type) => (
                    <option key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {!disney && (
              <label className="span-two">
                Catatan

                <textarea
                  rows={3}
                  value={form.deskripsi || ""}
                  onChange={(event) =>
                    update(
                      "deskripsi",
                      event.target.value,
                    )
                  }
                />
              </label>
            )}
          </div>

          {(disney || week) && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={auto}
                onChange={(event) => {
                  setAuto(event.target.checked);

                  if (event.target.checked) {
                    setForm((previous) => ({
                      ...previous,

                      [disney
                        ? "tanggal_reset"
                        : "durasi_habis"]: addDays(
                        previous.tanggal_terjual,
                        disney
                          ? Number(previous.durasi)
                          : 7,
                      ),
                    }));
                  }
                }}
              />

              {disney
                ? "Hitung reset dari durasi"
                : "Hitung habis dari tanggal terjual + 7 hari"}
            </label>
          )}

          <div className="form-hint">
            <I icon={bell} />

            <span>
              Reminder {week ? "H−2" : "H−3"} sebelum
              jatuh tempo.
            </span>
          </div>

          {formError && (
            <div
              className="form-error"
              role="alert"
            >
              {formError}
            </div>
          )}
        </div>

        <div className="modal-footer">

          <button
            type="button"
            className="btn secondary"
            disabled={busy}
            onClick={onClose}
          >
            Batal
          </button>

          <button
            type="submit"
            className="btn primary"
            disabled={busy}
          >
            <I
              icon={
                busy
                  ? loaderCircle
                  : check
              }
            />

            {busy
              ? "Menyimpan…"
              : "Simpan akun"}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

// ==========================================
// IMPORT EXCEL MODAL
// ==========================================

function ImportModal({
  kind,
  demo,
  existing,
  onClose,
  onDone,
  onTemplate,
}) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const input = useRef(null);

  async function read(file) {
    if (!file) return;

    setError("");
    setPreview(null);

    if (
      !file.name.toLowerCase().endsWith(".xlsx")
    ) {
      setError("Pilih file Excel .xlsx");
      return;
    }

    if (
      file.size > 5 * 1024 * 1024
    ) {
      setError("Ukuran file maksimal 5 MB.");
      return;
    }

    setBusy(true);
    setFilename(file.name);

    try {
      const { parseWorkbook } = await import(
        "../shared/excel.js"
      );

      const parsed = await parseWorkbook(
        await file.arrayBuffer(),
        kind,
      );

      const distinct = uniqueRows(
        existing,
        parsed.rows,
      );

      setPreview({
        ...parsed,
        duplicates: distinct.skipped,
        rows: distinct.rows,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (
      !preview?.rows.length ||
      preview.errors.length
    ) {
      return;
    }

    setBusy(true);

    try {
      const result = await request(
        "/accounts/import",
        {
          method: "POST",
          body: {
            rows: preview.rows,
          },
        },
        demo,
      );

      await onDone();

      await success(
        "Impor selesai!",
        `${result.imported} akun berhasil ditambahkan. ${
          result.skipped + preview.duplicates
        } duplikat dilewati.`,
      );
    } catch (err) {
      await failure(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalFrame
      title={`Impor ${names[kind]}`}
      subtitle="Impor Excel atau unduh template format Orinimo."
      busy={busy}
      onClose={onClose}
    >
      <div className="modal-body">

        <div className="import-help">
          <I icon={fileSpreadsheet} size={20} />

          <span>
            Header kolom harus sesuai format template.
          </span>

          <button
            type="button"
            className="text-btn"
            onClick={onTemplate}
          >
            Unduh template
            <I icon={download} size={14} />
          </button>
        </div>

        <input
          ref={input}
          type="file"
          accept=".xlsx"
          hidden
          onChange={(event) =>
            read(event.target.files?.[0])
          }
        />

        <button
          type="button"
          className="dropzone"
          disabled={busy}
          onClick={() =>
            input.current?.click()
          }
          onDragOver={(event) =>
            event.preventDefault()
          }
          onDrop={(event) => {
            event.preventDefault();

            if (!busy) {
              read(event.dataTransfer.files?.[0]);
            }
          }}
        >
          <span>
            <I
              icon={
                busy
                  ? loaderCircle
                  : upload
              }
              size={28}
            />
          </span>

          <strong>
            {busy
              ? "Membaca file..."
              : filename ||
                "Pilih atau tarik file Excel ke sini"}
          </strong>

          <small>
            .xlsx · Maksimal 5 MB / 2.000 baris
          </small>
        </button>

        {error && (
          <div
            className="form-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {preview && (
          <>
            <div className="import-stats">

              <span>
                <b>
                  {preview.rows.length}
                </b>
                siap diimpor
              </span>

              <span>
                <b>
                  {preview.duplicates}
                </b>
                duplikat dilewati
              </span>

              <span>
                <b>
                  {preview.errors.length}
                </b>
                kesalahan
              </span>
            </div>

            {preview.errors.length > 0 ? (
              <div className="form-error">
                <strong>
                  Perbaiki baris berikut:
                </strong>

                <ul>
                  {preview.errors
                    .slice(0, 8)
                    .map((err) => (
                      <li key={err.row}>
                        Baris {err.row}: {err.message}
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <p className="import-ok">
                <I icon={circleCheck} />
                Data siap disimpan.
              </p>
            )}
          </>
        )}

        {demo && (
          <p className="form-hint">
            Mode demo: data hanya di memori tab.
          </p>
        )}
      </div>

      <div className="modal-footer">

        <button
          type="button"
          className="btn secondary"
          disabled={busy}
          onClick={onClose}
        >
          Batal
        </button>

        <button
          type="button"
          className="btn primary"
          disabled={
            busy ||
            !preview?.rows.length ||
            !!preview?.errors.length
          }
          onClick={apply}
        >
          <I icon={upload} />
          Impor {preview?.rows.length || ""} akun
        </button>
      </div>
    </ModalFrame>
  );
}

// ==========================================
// SETTINGS
// ==========================================

function Settings({
  demo,
  email,
  theme,
  onThemeToggle,
}) {
  const groups = [
    [
      "Informasi workspace",
      [
        ["Workspace", "Orinimo"],
        [
          "Akun admin",
          demo ? "Demo Admin" : email || "–",
        ],
        [
          "Penyimpanan",
          demo
            ? "Demo (memori tab)"
            : "Supabase",
        ],
        [
          "Zona waktu",
          "Asia/Makassar (WITA)",
        ],
      ],
    ],
    [
      "Aturan reminder",
      [
        ["Netflix bulanan", "H−3"],
        ["Netflix mingguan", "H−2"],
        ["Disney+", "H−3"],
        [
          "Canva",
          "H−3 sebelum tanggal berakhir",
        ],
      ],
    ],
  ];

  return (
    <div className="settings-grid">

      {groups.map(([heading, items]) => (
        <section
          key={heading}
          className="panel settings-panel"
        >
          <h2>{heading}</h2>

          <p>
            Pengaturan operasional Orinimo
          </p>

          <dl>
            {items.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <section className="panel settings-panel theme-settings">

        <h2>Tampilan</h2>

        <p>
          Pilih tema yang nyaman digunakan.
        </p>

        <div className="theme-setting-row">
          <span>
            <I
              icon={
                theme === "dark"
                  ? moon
                  : sun
              }
            />

            <strong>
              Mode {theme === "dark" ? "gelap" : "terang"}
            </strong>
          </span>

          <ThemeToggle
            theme={theme}
            onToggle={onThemeToggle}
          />
        </div>

        <div className="form-hint">
          <I icon={bell} />

          <span>
            Reminder hanya tampil di aplikasi.
            Tidak mengirim email atau WhatsApp.
          </span>
        </div>
      </section>
    </div>
  );
}

// ==========================================
// RENDER APPLICATION
// ==========================================

createRoot(
  document.getElementById("root"),
).render(<App />);
