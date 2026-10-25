import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { Icon as Iconify } from "@iconify/react";
import layoutDashboard from "@iconify-icons/lucide/layout-dashboard";
import clapperboard from "@iconify-icons/lucide/clapperboard";
import calendarDays from "@iconify-icons/lucide/calendar-days";
import sparkles from "@iconify-icons/lucide/sparkles";
import bell from "@iconify-icons/lucide/bell";
import search from "@iconify-icons/lucide/search";
import plus from "@iconify-icons/lucide/plus";
import arrowUpRight from "@iconify-icons/lucide/arrow-up-right";
import arrowRight from "@iconify-icons/lucide/arrow-right";
import chevronRight from "@iconify-icons/lucide/chevron-right";
import chevronLeft from "@iconify-icons/lucide/chevron-left";
import download from "@iconify-icons/lucide/download";
import upload from "@iconify-icons/lucide/upload";
import slidersHorizontal from "@iconify-icons/lucide/sliders-horizontal";
import ellipsis from "@iconify-icons/lucide/ellipsis";
import check from "@iconify-icons/lucide/check";
import circleCheck from "@iconify-icons/lucide/circle-check";
import clock3 from "@iconify-icons/lucide/clock-3";
import alertCircle from "@iconify-icons/lucide/alert-circle";
import logOut from "@iconify-icons/lucide/log-out";
import menu from "@iconify-icons/lucide/menu";
import x from "@iconify-icons/lucide/x";
import eye from "@iconify-icons/lucide/eye";
import eyeOff from "@iconify-icons/lucide/eye-off";
import pencil from "@iconify-icons/lucide/pencil";
import trash2 from "@iconify-icons/lucide/trash-2";
import copy from "@iconify-icons/lucide/copy";
import refreshCw from "@iconify-icons/lucide/refresh-cw";
import shieldCheck from "@iconify-icons/lucide/shield-check";
import monitor from "@iconify-icons/lucide/monitor";
import mapPin from "@iconify-icons/lucide/map-pin";
import mail from "@iconify-icons/lucide/mail";
import lockKeyhole from "@iconify-icons/lucide/lock-keyhole";
import fileSpreadsheet from "@iconify-icons/lucide/file-spreadsheet";
import loaderCircle from "@iconify-icons/lucide/loader-circle";
import settings2 from "@iconify-icons/lucide/settings-2";
import moon from "@iconify-icons/lucide/moon";
import sun from "@iconify-icons/lucide/sun";
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
  diffDays,
  todayBreakdown,
  cleanRecord,
  uniqueRows,
} from "../shared/domain.js";
import {
  configured,
  demoAllowed,
  supabase,
  request,
  startDemo,
} from "./data.js";
import {
  AppIcon,
  Service,
  NetflixIcon,
  WeekIcon,
  DisneyIcon,
  WelcomeScreen,
} from "./Visuals.jsx";
import { success, failure, confirm, toast } from "./dialogs.js";
import "./style.css";
const icon = (iconData) =>
  function AppIconify({ size = 24, className, ...props }) {
    return (
      <Iconify
        icon={iconData}
        width={size}
        height={size}
        className={className}
        {...props}
      />
    );
  };
const LayoutDashboard = icon(layoutDashboard);
const Clapperboard = icon(clapperboard);
const CalendarDays = icon(calendarDays);
const Sparkles = icon(sparkles);
const Bell = icon(bell);
const Search = icon(search);
const Plus = icon(plus);
const ArrowUpRight = icon(arrowUpRight);
const ArrowRight = icon(arrowRight);
const ChevronRight = icon(chevronRight);
const ChevronLeft = icon(chevronLeft);
const Download = icon(download);
const Upload = icon(upload);
const SlidersHorizontal = icon(slidersHorizontal);
const MoreHorizontal = icon(ellipsis);
const Check = icon(check);
const CheckCircle2 = icon(circleCheck);
const Clock3 = icon(clock3);
const AlertCircle = icon(alertCircle);
const LogOut = icon(logOut);
const Menu = icon(menu);
const X = icon(x);
const Eye = icon(eye);
const EyeOff = icon(eyeOff);
const Pencil = icon(pencil);
const Trash2 = icon(trash2);
const Copy = icon(copy);
const RefreshCw = icon(refreshCw);
const ShieldCheck = icon(shieldCheck);
const Monitor = icon(monitor);
const MapPin = icon(mapPin);
const Mail = icon(mail);
const LockKeyhole = icon(lockKeyhole);
const FileSpreadsheet = icon(fileSpreadsheet);
const LoaderCircle = icon(loaderCircle);
const Settings2 = icon(settings2);
function ThemeToggle({ theme, onToggle, className = "" }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={onToggle}
      aria-label={`Aktifkan mode ${isDark ? "terang" : "gelap"}`}
      title={`Mode ${isDark ? "terang" : "gelap"}`}
    >
      <Iconify icon={isDark ? sun : moon} width={18} height={18} />
      <span>{isDark ? "Terang" : "Gelap"}</span>
    </button>
  );
}
const icons = { netflix: NetflixIcon, week: WeekIcon, disney: DisneyIcon };
const dateLabel = (
  s,
  options = { day: "2-digit", month: "short", year: "numeric" },
) =>
  s
    ? new Intl.DateTimeFormat("id-ID", options).format(
        new Date(s + "T00:00:00"),
      )
    : "Belum diatur";
const identity = (r) => (r.kind === "disney" ? r.profil : r.email);
function Brand({ large = false }) {
  return (
    <div className={"brand " + (large ? "large" : "")}>
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
function Badge({ record, date }) {
  const s = status(record, date);
  return (
    <span className={"badge " + s.tone}>
      <i />
      {s.label}
    </span>
  );
}
function App() {
  const prefersReducedMotion = useReducedMotion();
  const lenisRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("orinimo-theme");
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (error) {
      console.error("Preferensi tema tidak dapat dibaca.", error);
      return "light";
    }
  });
  const [welcomeUser, setWelcomeUser] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [session, setSession] = useState(null),
    [demo, setDemo] = useState(false),
    [authReady, setAuthReady] = useState(!configured),
    [boot, setBoot] = useState(true);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    try {
      localStorage.setItem("orinimo-theme", theme);
    } catch (error) {
      console.error("Preferensi tema tidak dapat disimpan.", error);
    }
  }, [theme]);
  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

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
  }, [prefersReducedMotion]);
  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0.65 });
      return;
    }
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };
  useEffect(() => {
    const t = setTimeout(() => setBoot(false), 700);
    let subscription;
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setAuthReady(true);
      });
      subscription = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s);
        setAuthReady(true);
      }).data.subscription;
    }
    return () => {
      clearTimeout(t);
      subscription?.unsubscribe();
    };
  }, []);
  if (boot || !authReady)
    return (
      <div className="loading-screen">
        <ThemeToggle
          theme={theme}
          onToggle={toggleTheme}
          className="loading-theme-toggle"
        />
        <Brand large />
        <div className="loading-bar">
          <i />
        </div>
        <p>Menyiapkan ruang kerjamu</p>
      </div>
    );
  const isWelcome = welcomeUser && session?.user.id === welcomeUser.id;
  const isWorkspace = (session && !signingIn) || demo;
  const screenKey = isWelcome
    ? "welcome"
    : isWorkspace
      ? `workspace-${demo ? "demo" : session.user.id}`
      : "login";
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
    <Login
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
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={screenKey}
        className="screen-transition"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: prefersReducedMotion ? 1 : 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.22,
          ease: "easeInOut",
        }}
      >
        {screen}
      </motion.div>
    </AnimatePresence>
  );
}
function Login({
  onDemo,
  onLoginStart,
  onSuccess,
  onLoginEnd,
  theme,
  onThemeToggle,
}) {
  const [busy, setBusy] = useState(false),
    [visible, setVisible] = useState(false);
  async function login(e) {
    e.preventDefault();
    if (busy || !configured || !supabase) return;
    setBusy(true);
    onLoginStart();
    try {
      const f = new FormData(e.target);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: f.get("email"),
        password: f.get("password"),
      });
      if (error)
        throw new Error("Email atau password salah. Silakan periksa kembali.");
      if (!data.session)
        throw new Error("Sesi login tidak tersedia. Silakan coba lagi.");
      onSuccess(data.session);
    } catch (e) {
      await failure(e);
    } finally {
      setBusy(false);
      onLoginEnd();
    }
  }
  return (
    <div className="login">
      <ThemeToggle
        theme={theme}
        onToggle={onThemeToggle}
        className="login-theme-toggle"
      />
      <section className="login-story">
        <Brand large />
        <div className="story-body">
          <span className="eyebrow">A LITTLE MORE ORGANIZED.</span>
          <h1>
            Semua akun.
            <br />
            Satu ruang
            <br />
            <em>yang teratur.</em>
          </h1>
          <p>
            Kelola langganan, pantau masa aktif, dan jangan lewatkan jadwal
            reset berikutnya.
          </p>
          <div className="story-services">
            <Service kind="netflix" />
            <Service kind="week" />
            <Service kind="disney" />
            <span>Netflix & Disney+</span>
          </div>
        </div>
        <span className="story-foot">
          MADE FOR YOUR EVERYDAY WORKFLOW <ArrowUpRight size={18} />
        </span>
        <div className="orb orb-one" />
        <div className="orb orb-two" />
      </section>
      <section className="login-form">
        <div>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Senang melihatmu lagi.</h2>
          <p>Masuk untuk melanjutkan pengelolaan akunmu.</p>
          <form onSubmit={login}>
            <label>
              Email admin
              <div className="input-icon">
                <Mail size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  autoComplete="username"
                  required
                  disabled={!configured}
                />
              </div>
            </label>
            <label>
              Password
              <div className="input-icon">
                <LockKeyhole size={18} />
                <input
                  name="password"
                  type={visible ? "text" : "password"}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                  disabled={!configured}
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={
                    visible ? "Sembunyikan password" : "Tampilkan password"
                  }
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <button className="btn primary wide" disabled={!configured || busy}>
              {busy ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <>
                  Masuk ke workspace <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          {!configured && (
            <div className="setup-note">
              <ShieldCheck size={18} />
              <span>
                Workspace belum terhubung. Konfigurasi Supabase diperlukan untuk
                masuk dengan akun admin.
              </span>
            </div>
          )}
          {demoAllowed && (
            <>
              <div className="divider">
                <span>lihat dulu tampilannya</span>
              </div>
              <button
                className="btn secondary wide"
                onClick={onDemo}
                disabled={busy}
              >
                Jelajahi demo interaktif <ArrowUpRight size={17} />
              </button>
              <small className="demo-caption">
                Data contoh • Tidak tersimpan setelah halaman dimuat ulang
              </small>
            </>
          )}
          <div className="login-foot">
            <ShieldCheck size={16} /> Akses khusus administrator
          </div>
        </div>
      </section>
    </div>
  );
}
function Workspace({
  demo,
  session,
  onLogout,
  theme,
  onThemeToggle,
  scrollToTop,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [view, setView] = useState("dashboard"),
    [rows, setRows] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [remKind, setRemKind] = useState("all"),
    [page, setPage] = useState(1),
    [modal, setModal] = useState(null),
    [importOpen, setImportOpen] = useState(false),
    [mobile, setMobile] = useState(false),
    [busy, setBusy] = useState(false),
    [sort, setSort] = useState("newest"),
    [clock, setClock] = useState(today());
  const selectedKind = kinds.includes(view) ? view : "netflix";
  async function reload() {
    setLoading(true);
    setError("");
    try {
      setRows(await request("/accounts", {}, demo));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    reload();
    const t = setInterval(() => setClock(today()), 60000);
    return () => clearInterval(t);
  }, []);
  function navigate(v, kind) {
    scrollToTop();
    setView(v);
    setQuery("");
    setFilter(v === "reminders" ? "today" : "all");
    setPage(1);
    setMobile(false);
    if (kind) setRemKind(kind);
  }
  const reminders = useMemo(
    () =>
      rows
        .filter((r) =>
          ["overdue", "today", "soon"].includes(status(r, clock).key),
        )
        .sort((a, b) => dueDate(a).localeCompare(dueDate(b))),
    [rows, clock],
  );
  const totalToday = rows.filter(
    (r) => status(r, clock).key === "today",
  ).length;
  const todaySummary = todayBreakdown(rows, clock);
  const title =
    view === "dashboard"
      ? "Dashboard"
      : view === "reminders"
        ? "Pusat reminder"
        : view === "settings"
          ? "Pengaturan"
          : `Rekapan ${names[view]}`;
  async function save(data, id) {
    setBusy(true);
    try {
      const result = await request(
        id ? `/accounts/${id}` : "/accounts",
        { method: id ? "PUT" : "POST", body: cleanRecord(data) },
        demo,
      );
      setRows((prev) =>
        id ? prev.map((r) => (r.id === id ? result : r)) : [result, ...prev],
      );
      setModal(null);
      await success(
        id ? "Perubahan tersimpan!" : "Akun berhasil ditambahkan!",
        `${names[data.kind]} sudah diperbarui. Jadwal reminder otomatis menyesuaikan.`,
      );
    } catch (e) {
      await failure(e);
    } finally {
      setBusy(false);
    }
  }
  async function remove(r) {
    const a = await confirm(
      "Hapus akun ini?",
      `${identity(r)} akan dihapus dari rekapan dan reminder. Tindakan ini tidak bisa dibatalkan.`,
      "Ya, hapus akun",
    );
    if (!a.isConfirmed) return;
    try {
      await request(`/accounts/${r.id}`, { method: "DELETE" }, demo);
      setRows((prev) => prev.filter((x) => x.id !== r.id));
      await success(
        "Akun berhasil dihapus",
        "Rekapan dan reminder sudah diperbarui.",
      );
    } catch (e) {
      await failure(e);
    }
  }
  async function exportRows(kind, template = false) {
    try {
      if (!template && kind !== "disney") {
        const a = await confirm(
          "Ekspor data akun?",
          "File Excel akan memuat email dan password akun. Simpan file di tempat yang aman.",
          "Ekspor Excel",
        );
        if (!a.isConfirmed) return;
      }
      const { writeWorkbook } = await import("../shared/excel.js");
      const list = rows.filter((r) => r.kind === kind);
      const bytes = await writeWorkbook(list, kind, template);
      const url = URL.createObjectURL(
        new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template ? "template-" : ""}rekapan-${kind}-${today()}.xlsx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast(template ? "Template siap diunduh" : "Excel siap diunduh");
    } catch (e) {
      await failure(e);
    }
  }
  async function logout() {
    const a = await confirm(
      "Keluar dari workspace?",
      demo
        ? "Perubahan pada data demo akan hilang."
        : "Sesi admin akan diakhiri.",
      "Keluar",
    );
    if (a.isConfirmed)
      try {
        await onLogout();
      } catch (e) {
        failure(e);
      }
  }
  const nav = (v, label, Icon, count) => (
    <button
      className={"nav-link " + (view === v ? "active" : "")}
      onClick={() => navigate(v)}
    >
      <Icon size={kinds.includes(v) ? 28 : 19} />
      <span>{label}</span>
      {count > 0 && <b>{count}</b>}
    </button>
  );
  let listing = rows
    .filter((r) =>
      view === "reminders"
        ? (remKind === "all" || r.kind === remKind) &&
          ["overdue", "today", "soon"].includes(status(r, clock).key)
        : r.kind === view,
    )
    .filter(
      (r) =>
        (filter === "all" || status(r, clock).key === filter) &&
        [
          r.email,
          r.profil,
          r.nomor,
          r.device,
          r.lokasi,
          r.tipe_sharing,
          r.deskripsi,
        ].some((s) => s?.toLowerCase().includes(query.toLowerCase())),
    );
  listing.sort((a, b) =>
    sort === "due"
      ? (dueDate(a) || "9999").localeCompare(dueDate(b) || "9999")
      : sort === "name"
        ? identity(a).localeCompare(identity(b))
        : b.created_at.localeCompare(a.created_at),
  );
  const pages = Math.max(1, Math.ceil(listing.length / 8)),
    safePage = Math.min(page, pages);
  return (
    <div className="app-shell">
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="Tutup menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <Brand />
        <span className="nav-label">WORKSPACE</span>
        <nav>
          {nav("dashboard", "Dashboard", LayoutDashboard)}
          <span className="nav-label inner">KELOLA AKUN</span>
          {nav("netflix", "Netflix", NetflixIcon)}
          {nav("week", "Netflix 1 Week", WeekIcon)}
          {nav("disney", "Disney+", DisneyIcon)}
          <span className="nav-label inner">MONITORING</span>
          {nav("reminders", "Reminder", Bell, reminders.length)}
          {nav("settings", "Pengaturan", Settings2)}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="user-card"
            onClick={logout}
            title="Keluar dari workspace"
          >
            <span className="user-avatar">
              {demo ? "D" : (session?.user.email || "A")[0].toUpperCase()}
            </span>
            <span>
              <strong>
                {demo ? "Demo Admin" : session?.user.email?.split("@")[0]}
              </strong>
              <small>
                {demo
                  ? "Mode demo"
                  : session?.user.app_metadata?.role === "admin"
                    ? "Administrator"
                    : "Pengguna"}
              </small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="icon-btn mobile-menu"
              aria-label="Buka menu"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">
              Workspace <ChevronRight size={14} />
              <strong>{title}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />
            {demo ? (
              <span className="demo-pill">Mode demo</span>
            ) : (
              <span className="connection">
                <i /> Workspace aktif
              </span>
            )}
            <button
              className="icon-btn notification"
              aria-label="Buka reminder"
              onClick={() => navigate("reminders")}
            >
              <Bell size={20} />
              {reminders.length > 0 && <i />}
            </button>
            <span className="top-avatar">
              {demo ? "D" : (session?.user.email || "A")[0].toUpperCase()}
            </span>
          </div>
        </header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={view}
            className="main-content"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -5 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
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
                  {view === "dashboard" ? "Overview" : title}
                  <span className="heading-dot">.</span>
                </h1>
                <p>
                  {view === "dashboard"
                    ? "Selamat datang kembali. Semua akunmu, dalam kendali."
                    : view === "reminders"
                      ? "Satu tempat untuk semua jadwal reset dan masa aktif."
                      : view === "settings"
                        ? "Informasi workspace dan preferensi pengelolaan akun."
                        : `Kelola, pantau, dan perbarui akun ${names[view]} dengan mudah.`}
                </p>
              </div>
              <div className="heading-actions">
                {view === "dashboard" ? (
                  <span className="date-chip">
                    <CalendarDays size={16} />
                    {dateLabel(clock, {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                ) : kinds.includes(view) ? (
                  <>
                    <button
                      className="btn secondary"
                      onClick={() => exportRows(selectedKind)}
                    >
                      <Download size={16} /> Ekspor Excel
                    </button>
                    <button
                      className="btn primary"
                      onClick={() => setModal({ kind: selectedKind })}
                    >
                      <Plus size={18} /> Tambah akun
                    </button>
                  </>
                ) : null}
              </div>
            </div>
            {error ? (
              <div className="error-state">
                <AlertCircle />
                <h3>Data belum dapat dimuat</h3>
                <p>{error}</p>
                <button className="btn primary" onClick={reload}>
                  <RefreshCw size={17} /> Coba lagi
                </button>
              </div>
            ) : loading ? (
              <div className="skeleton-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton" />
                ))}
                <div className="skeleton full" />
              </div>
            ) : (
              <>
                {view === "dashboard" ? (
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
                    {kinds.includes(view) && (
                      <div className="mini-stats">
                        <div>
                          <span>Total akun</span>
                          <strong>
                            {rows.filter((r) => r.kind === view).length}
                            <small>akun</small>
                          </strong>
                        </div>
                        <div>
                          <span>Aktif</span>
                          <strong className="green-text">
                            {
                              rows.filter(
                                (r) =>
                                  r.kind === view &&
                                  status(r, clock).key === "active",
                              ).length
                            }
                            <small>akun</small>
                          </strong>
                        </div>
                        <div>
                          <span>Perlu perhatian</span>
                          <strong className="brand-text">
                            {reminders.filter((r) => r.kind === view).length}
                            <small>akun</small>
                          </strong>
                        </div>
                      </div>
                    )}
                    {view === "reminders" && (
                      <>
                        <div className="reminder-intro">
                          <span className="reminder-symbol">
                            <Bell size={24} />
                          </span>
                          <div>
                            <h3>
                              {totalToday
                                ? `${totalToday} akun perlu ditangani hari ini`
                                : "Pantau jadwal berikutnya"}
                            </h3>
                            <p>
                              Netflix & Disney: H−3 · Netflix mingguan: H−2 ·
                              Zona waktu WITA
                            </p>
                            {todaySummary.length > 0 && (
                              <ul className="reminder-breakdown">
                                {todaySummary.map((item) => (
                                  <li key={`${item.kind}:${item.sharing}`}>
                                    <span
                                      className={`breakdown-dot ${item.kind}`}
                                    />
                                    <strong>{item.count} akun</strong>
                                    <span>
                                      {item.kind === "netflix"
                                        ? `Netflix · ${item.sharing}`
                                        : names[item.kind]}
                                    </span>
                                    <span>reset hari ini</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                        <div className="tabs service-tabs">
                          {["all", ...kinds].map((k) => (
                            <button
                              className={remKind === k ? "selected" : ""}
                              key={k}
                              onClick={() => {
                                setRemKind(k);
                                setPage(1);
                              }}
                            >
                              {k === "all" ? "Semua layanan" : names[k]}
                              <span>
                                {
                                  reminders.filter(
                                    (r) => k === "all" || r.kind === k,
                                  ).length
                                }
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <section className="panel records-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>
                            {view === "reminders"
                              ? "Jadwal yang perlu diperhatikan"
                              : "Daftar akun"}{" "}
                            <span className="count-tag">{listing.length}</span>
                          </h2>
                          <p>
                            {view === "disney"
                              ? "Profil, perangkat, lokasi, dan masa aktif Disney+."
                              : view === "reminders"
                                ? "Perbarui tanggal untuk menjadwalkan pengingat berikutnya."
                                : "Semua informasi akun tersimpan di satu tempat."}
                          </p>
                        </div>
                        {kinds.includes(view) && (
                          <button
                            className="btn secondary small"
                            onClick={() => setImportOpen(true)}
                          >
                            <Upload size={15} /> Impor Excel
                          </button>
                        )}
                      </div>
                      <div className="table-toolbar">
                        <div className="search-field">
                          <Search size={18} />
                          <input
                            aria-label="Cari akun"
                            placeholder={
                              view === "disney"
                                ? "Cari nomor, profil, atau lokasi…"
                                : "Cari akun, profil, atau catatan…"
                            }
                            value={query}
                            onChange={(e) => {
                              setQuery(e.target.value);
                              setPage(1);
                            }}
                          />
                          {query && (
                            <button
                              className="icon-btn"
                              aria-label="Hapus pencarian"
                              onClick={() => setQuery("")}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <div className="toolbar-select">
                          <SlidersHorizontal size={15} />
                          <select
                            aria-label="Filter status"
                            value={filter}
                            onChange={(e) => {
                              setFilter(e.target.value);
                              setPage(1);
                            }}
                          >
                            <option value="all">Semua status</option>
                            <option value="today">Hari ini</option>
                            <option value="soon">Segera</option>
                            <option value="overdue">Terlewat</option>
                            {view !== "reminders" && (
                              <>
                                <option value="active">Aktif</option>
                                <option value="unset">Belum diatur</option>
                              </>
                            )}
                          </select>
                        </div>
                        <select
                          className="sort-select"
                          aria-label="Urutkan akun"
                          value={sort}
                          onChange={(e) => setSort(e.target.value)}
                        >
                          <option value="newest">Terbaru</option>
                          <option value="due">Tanggal terdekat</option>
                          <option value="name">Nama A–Z</option>
                        </select>
                      </div>
                      <AccountTable
                        records={listing.slice(
                          (safePage - 1) * 8,
                          safePage * 8,
                        )}
                        view={view}
                        date={clock}
                        offset={(safePage - 1) * 8}
                        onEdit={(r) => setModal(r)}
                        onDelete={remove}
                      />
                      <div className="pagination">
                        <span>
                          Menampilkan{" "}
                          <b>
                            {listing.length ? (safePage - 1) * 8 + 1 : 0}–
                            {Math.min(safePage * 8, listing.length)}
                          </b>{" "}
                          dari <b>{listing.length}</b> akun
                        </span>
                        <div>
                          <button
                            className="icon-btn"
                            aria-label="Halaman sebelumnya"
                            disabled={safePage === 1}
                            onClick={() => setPage(safePage - 1)}
                          >
                            <ChevronLeft size={17} />
                          </button>
                          <span className="page-current">{safePage}</span>
                          <span className="page-of">/ {pages}</span>
                          <button
                            className="icon-btn"
                            aria-label="Halaman berikutnya"
                            disabled={safePage === pages}
                            onClick={() => setPage(safePage + 1)}
                          >
                            <ChevronRight size={17} />
                          </button>
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </>
            )}
            <footer className="page-footer">
              <span>
                © {new Date().getFullYear()} Orinimo
                <span className="footer-dot">•</span>Made for a simpler
                workflow.
              </span>
              <span>
                <ShieldCheck size={13} />
                {demo
                  ? "Data contoh · tidak tersimpan"
                  : "Akses admin terlindungi"}
              </span>
            </footer>
          </motion.main>
        </AnimatePresence>
      </div>
      {modal && (
        <AccountModal
          record={modal}
          busy={busy}
          onClose={() => !busy && setModal(null)}
          onSave={save}
        />
      )}
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
          onTemplate={() => exportRows(selectedKind, true)}
        />
      )}
    </div>
  );
}
function Dashboard({ rows, reminders, totalToday, date, navigate, setModal }) {
  const active = rows.filter((r) => status(r, date).key === "active").length;
  const soon = reminders.filter((r) => status(r, date).key === "soon").length;
  const overdue = reminders.filter(
    (r) => status(r, date).key === "overdue",
  ).length;
  const stats = [
    {
      label: "Total akun",
      value: rows.length,
      sub: "di seluruh layanan",
      Icon: Clapperboard,
      tone: "red",
    },
    {
      label: "Akun aktif",
      value: active,
      sub: "masa aktif masih aman",
      Icon: ShieldCheck,
      tone: "green",
    },
    {
      label: "Jadwal hari ini",
      value: totalToday,
      sub: "siap untuk diperbarui",
      Icon: CalendarDays,
      tone: "orange",
    },
    {
      label: "Segera berakhir",
      value: soon,
      sub: "dalam 2–3 hari ke depan",
      Icon: Clock3,
      tone: "purple",
    },
  ];
  return (
    <>
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div
            key={s.label}
            style={{ animationDelay: `${i * 55}ms` }}
            className="stat-card"
          >
            <div className="stat-top">
              <span>{s.label}</span>
              <span className={"stat-icon " + s.tone}>
                <s.Icon size={18} />
              </span>
            </div>
            <strong>{s.value.toString().padStart(2, "0")}</strong>
            <div className="stat-bottom">
              <span>{s.sub}</span>
              <ArrowUpRight size={15} />
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-middle">
        <section className="welcome-card">
          <span className="eyebrow">LESS MANAGING. MORE LIVING.</span>
          <h2>
            Rapi akunnya.
            <br />
            Tenang harinya.
          </h2>
          <p>
            Kelola semua langganan tanpa kehilangan
            <br className="desktop" /> satu pun jadwal penting.
          </p>
          <button
            onClick={() => setModal({ kind: "netflix" })}
            className="btn light"
          >
            <Plus size={17} /> Tambah akun baru <ArrowUpRight size={17} />
          </button>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <div className="floating-card behind">
              <CalendarDays size={23} />
              <div />
              <div />
            </div>
            <div className="floating-card front">
              <span className="check-circle">
                <Check size={27} />
              </span>
              <b>All under control.</b>
              <small>A little more organized.</small>
              <div className="art-line" />
              <div className="art-line short" />
              <div className="art-avatars">
                <Service kind="netflix" />
                <Service kind="disney" />
                <span>
                  <Check size={12} />
                </span>
              </div>
            </div>
            <Sparkles className="art-spark" size={26} />
          </div>
        </section>
        <section className="panel portfolio">
          <div className="panel-heading">
            <h2>Ringkasan layanan</h2>
            <span className="subtle-icon">
              <Clapperboard size={18} />
            </span>
          </div>
          <p className="portfolio-sub">Semua langganan dalam satu pandangan.</p>
          {kinds.map((k) => {
            const count = rows.filter((r) => r.kind === k).length;
            return (
              <button
                className="service-row"
                key={k}
                onClick={() => navigate(k)}
              >
                <Service kind={k} />
                <span>
                  <strong>{names[k]}</strong>
                  <small>
                    {k === "netflix"
                      ? "Akun bulanan"
                      : k === "week"
                        ? "Paket mingguan"
                        : "Profil & perangkat"}
                  </small>
                </span>
                <b>{count}</b>
                <ChevronRight size={16} />
              </button>
            );
          })}
          <div className="portfolio-total">
            <span>Total seluruh layanan</span>
            <strong>{rows.length} akun</strong>
          </div>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="panel reminder-panel">
          <div className="panel-heading">
            <div>
              <h2>
                Perlu perhatian{" "}
                <span className="count-tag">{reminders.length}</span>
              </h2>
              <p>Jadwal terdekat, jangan sampai terlewat.</p>
            </div>
            <button className="text-btn" onClick={() => navigate("reminders")}>
              Lihat semua <ArrowUpRight size={15} />
            </button>
          </div>
          {reminders.length === 0 ? (
            <Empty
              title="Semua jadwal aman"
              text="Belum ada akun yang mendekati jadwal reset."
            />
          ) : (
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
                  {reminders.slice(0, 4).map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="account-cell">
                          <Service kind={r.kind} />
                          <span>
                            <strong>{identity(r)}</strong>
                            <small>{names[r.kind]}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        {dateLabel(dueDate(r), {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td>
                        <Badge record={r} date={date} />
                      </td>
                      <td>
                        <button
                          className="icon-btn"
                          aria-label={`Edit ${identity(r)}`}
                          onClick={() => setModal(r)}
                        >
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="panel quick-panel">
          <div className="panel-heading">
            <h2>Akses cepat</h2>
            <Sparkles size={18} className="muted" />
          </div>
          <p>Lebih sedikit klik, lebih banyak beres.</p>
          {kinds.map((k) => {
            const Icon = icons[k];
            return (
              <button
                key={k}
                className="quick-link"
                onClick={() => setModal({ kind: k })}
              >
                <span className="quick-icon">
                  <Icon size={28} />
                </span>
                <span>
                  <strong>Tambah {names[k]}</strong>
                  <small>
                    {k === "disney"
                      ? "Catat profil dan masa aktif"
                      : "Simpan akun baru"}
                  </small>
                </span>
                <Plus size={17} />
              </button>
            );
          })}
          <div className={"quick-notice " + (overdue ? "attention" : "")}>
            <span className="notice-icon">
              {overdue ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
            </span>
            <p>
              {overdue ? (
                <>
                  <b>{overdue} akun melewati jadwal.</b>
                  <br />
                  Yuk, perbarui tanggal resetnya.
                </>
              ) : (
                <>Reminder mengikuti tanggal akun secara otomatis.</>
              )}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
function Empty({
  title = "Tidak ada akun ditemukan",
  text = "Coba ubah pencarian atau tambahkan akun baru.",
}) {
  return (
    <div className="empty-state">
      <span>
        <FileSpreadsheet size={28} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Password({ value }) {
  const [show, setShow] = useState(false);
  return (
    <span className="password-cell">
      <code>{show ? value : "••••••••"}</code>
      <button
        className="icon-btn"
        aria-label={
          show ? "Sembunyikan password akun" : "Tampilkan password akun"
        }
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <button
        className="icon-btn"
        aria-label="Salin password"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            toast("Password disalin");
          } catch (e) {
            failure(new Error("Clipboard tidak tersedia di browser ini."));
          }
        }}
      >
        <Copy size={14} />
      </button>
    </span>
  );
}
function AccountTable({ records, view, date, offset, onEdit, onDelete }) {
  if (!records.length) return <Empty />;
  const disney = view === "disney",
    rem = view === "reminders",
    week = view === "week";
  return (
    <div className="table-scroll">
      <table className="account-table">
        <thead>
          <tr>
            <th>{disney ? "NOMOR" : "NO."}</th>
            <th>{disney ? "PROFIL" : "AKUN / PROFIL"}</th>
            {disney ? (
              <>
                <th>DEVICE</th>
                <th>LOKASI</th>
              </>
            ) : !rem ? (
              <th>PASSWORD</th>
            ) : (
              <th>LAYANAN / TIPE SHARING</th>
            )}
            {week || disney ? (
              <th>TERJUAL</th>
            ) : !rem ? (
              <th>TIPE SHARING</th>
            ) : null}
            <th>{rem ? "JADWAL" : week ? "TANGGAL HABIS" : "TANGGAL RESET"}</th>
            {disney && <th>DURASI</th>}
            <th>STATUS</th>
            <th>AKSI</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={r.id}>
              <td className="row-number">
                {disney ? r.nomor : String(offset + i + 1).padStart(2, "0")}
              </td>
              <td>
                <div className="account-cell">
                  {!disney && <Service kind={r.kind} />}
                  <span>
                    <strong>{identity(r)}</strong>
                    <small>
                      {r.deskripsi ||
                        (disney ? `Disney+ · ${r.nomor}` : names[r.kind])}
                    </small>
                  </span>
                </div>
              </td>
              {disney ? (
                <>
                  <td>{r.device}</td>
                  <td>{r.lokasi}</td>
                </>
              ) : !rem ? (
                <td>
                  <Password value={r.password} />
                </td>
              ) : (
                <td>
                  <span className="reminder-type">
                    <strong>{names[r.kind]}</strong>
                    <small>
                      {r.kind === "netflix"
                        ? r.tipe_sharing || "Tipe sharing belum diatur"
                        : r.kind === "week"
                          ? "Paket mingguan"
                          : "Reset akun"}
                    </small>
                  </span>
                </td>
              )}
              {week || disney ? (
                <td className="date-cell">{dateLabel(r.tanggal_terjual)}</td>
              ) : !rem ? (
                <td>
                  <span className="sharing-tag">{r.tipe_sharing}</span>
                </td>
              ) : null}
              <td className="date-cell">
                {dateLabel(dueDate(r))}
                {rem && (
                  <small className="remaining">
                    {status(r, date).days < 0
                      ? `${Math.abs(status(r, date).days)} hari terlewat`
                      : status(r, date).days === 0
                        ? "Hari ini"
                        : `${status(r, date).days} hari lagi`}
                  </small>
                )}
              </td>
              {disney && <td>{r.durasi} hari</td>}
              <td>
                <Badge record={r} date={date} />
              </td>
              <td>
                <div className="row-actions">
                  <button
                    className="icon-btn"
                    aria-label={`Edit ${identity(r)}`}
                    onClick={() => onEdit(r)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn delete"
                    aria-label={`Hapus ${identity(r)}`}
                    onClick={() => onDelete(r)}
                  >
                    <Trash2 size={16} />
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
function ModalFrame({ children, title, subtitle, onClose, busy }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const node = ref.current;
    const f = () => node.querySelector("input,select,button")?.focus();
    f();
    const handler = (e) => {
      if (document.querySelector(".swal2-container")) return;
      if (e.key === "Escape" && !busy) onClose();
      if (e.key === "Tab") {
        const items = [
          ...node.querySelectorAll(
            "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]",
          ),
        ].filter((x) => x.offsetParent !== null);
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [busy]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal"
        data-lenis-prevent
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">ORINIMO WORKSPACE</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button
            className="icon-btn"
            aria-label="Tutup dialog"
            disabled={busy}
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function AccountModal({ record, busy, onClose, onSave }) {
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
    }),
    [show, setShow] = useState(false),
    [auto, setAuto] = useState(!record.id),
    [formError, setFormError] = useState("");
  const disney = form.kind === "disney",
    week = form.kind === "week";
  function update(k, v) {
    setForm((p) => {
      const next = { ...p, [k]: v };
      if (auto && disney && ["tanggal_terjual", "durasi"].includes(k))
        next.tanggal_reset = addDays(next.tanggal_terjual, Number(next.durasi));
      if (auto && week && k === "tanggal_terjual")
        next.durasi_habis = addDays(v, 7);
      return next;
    });
  }
  const field = (
    k,
    label,
    type = "text",
    required = false,
    placeholder = "",
  ) => (
    <label key={k}>
      {label}
      {required && <span className="required"> *</span>}
      <input
        value={form[k] ?? ""}
        onChange={(e) => update(k, e.target.value)}
        onInput={type === "date" ? (e) => update(k, e.target.value) : undefined}
        type={type}
        required={required}
        placeholder={placeholder}
        min={type === "number" ? 1 : undefined}
        max={type === "number" ? 3650 : undefined}
      />
    </label>
  );
  function submit(e) {
    e.preventDefault();
    try {
      const data = cleanRecord(form);
      setFormError("");
      onSave(data, record.id);
    } catch (e) {
      setFormError(e.issues?.map((i) => i.message).join(" ") || e.message);
    }
  }
  return (
    <ModalFrame
      title={`${record.id ? "Edit" : "Tambah"} akun ${names[form.kind]}`}
      subtitle="Lengkapi informasi akun. Reminder akan mengikuti tanggal yang kamu atur."
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="form-grid">
            {disney ? (
              <>
                {field("nomor", "Nomor", "text", true, "Contoh: D-001")}
                {field("profil", "Profil", "text", true, "Nama profil")}
                {field("device", "Device", "text", true, "Contoh: Smart TV")}
                {field("lokasi", "Lokasi", "text", true, "Contoh: Denpasar")}
              </>
            ) : (
              <>
                <div className="span-two">
                  {field(
                    "email",
                    "Email akun",
                    "email",
                    true,
                    "akun@email.com",
                  )}
                </div>
                <label className="span-two">
                  Password akun <span className="required">*</span>
                  <div className="input-icon password-input">
                    <input
                      type={show ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      required
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Lihat password"
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
              </>
            )}
            {disney || week ? (
              <>
                {field("tanggal_terjual", "Tanggal terjual", "date", disney)}
                {disney
                  ? field("durasi", "Durasi (hari)", "number", true)
                  : field("durasi_habis", "Tanggal habis", "date")}
              </>
            ) : null}
            {!week && field("tanggal_reset", "Tanggal reset", "date", disney)}
            {!disney && !week && (
              <label>
                Tipe sharing <span className="required">*</span>
                <select
                  value={form.tipe_sharing}
                  onChange={(e) => update("tipe_sharing", e.target.value)}
                >
                  {sharingTypes.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            )}
            {!disney && (
              <label className="span-two">
                Catatan
                <textarea
                  rows="3"
                  placeholder="Tambahkan catatan jika diperlukan…"
                  value={form.deskripsi || ""}
                  onChange={(e) => update("deskripsi", e.target.value)}
                />
              </label>
            )}
          </div>
          {(disney || week) && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={auto}
                onChange={(e) => {
                  setAuto(e.target.checked);
                  if (e.target.checked)
                    setForm((f) => ({
                      ...f,
                      [disney ? "tanggal_reset" : "durasi_habis"]: addDays(
                        f.tanggal_terjual,
                        disney ? Number(f.durasi) : 7,
                      ),
                    }));
                }}
              />{" "}
              Hitung otomatis{" "}
              {disney
                ? "tanggal reset dari durasi"
                : "tanggal habis: terjual + 7 hari"}
            </label>
          )}
          <div className="form-hint">
            <Bell size={16} />
            <span>
              {disney
                ? "Reminder Disney muncul mulai 3 hari sebelum reset."
                : week
                  ? "Reminder mingguan muncul mulai 2 hari sebelum habis."
                  : "Reminder Netflix muncul mulai 3 hari sebelum reset."}{" "}
              Tanggal tetap dapat disesuaikan.
            </span>
          </div>
          {formError && (
            <div role="alert" className="form-error">
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
          <button className="btn primary" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Check size={17} />
            )}{" "}
            {busy ? "Menyimpan…" : "Simpan akun"}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
function ImportModal({ kind, demo, existing, onClose, onDone, onTemplate }) {
  const [preview, setPreview] = useState(null),
    [busy, setBusy] = useState(false),
    [filename, setFilename] = useState(""),
    [error, setError] = useState("");
  const input = useRef();
  async function read(file) {
    if (!file) return;
    setError("");
    setPreview(null);
    if (!file.name.endsWith(".xlsx")) {
      setError("Pilih file Excel berformat .xlsx.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5 MB.");
      return;
    }
    setBusy(true);
    setFilename(file.name);
    try {
      const { parseWorkbook } = await import("../shared/excel.js");
      const p = await parseWorkbook(await file.arrayBuffer(), kind);
      const distinct = uniqueRows(existing, p.rows);
      setPreview({ ...p, duplicates: distinct.skipped, rows: distinct.rows });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    setBusy(true);
    try {
      const result = await request(
        "/accounts/import",
        { method: "POST", body: { rows: preview.rows } },
        demo,
      );
      await onDone();
      await success(
        "Impor selesai!",
        `${result.imported} akun berhasil ditambahkan. ${result.skipped + preview.duplicates} duplikat dilewati.`,
      );
    } catch (e) {
      await failure(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <ModalFrame
      title={`Impor ${names[kind]}`}
      subtitle="Gunakan Excel dari website lama atau template di bawah ini."
      onClose={onClose}
      busy={busy}
    >
      <div className="modal-body">
        <div className="import-help">
          <FileSpreadsheet size={20} />
          <span>Header kolom mengikuti format ekspor asli.</span>
          <button className="text-btn" onClick={onTemplate}>
            Unduh template <Download size={14} />
          </button>
        </div>
        <input
          ref={input}
          type="file"
          accept=".xlsx"
          hidden
          onChange={(e) => read(e.target.files[0])}
        />
        <button
          disabled={busy}
          className="dropzone"
          onClick={() => input.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!busy) read(e.dataTransfer.files[0]);
          }}
        >
          <span>
            {busy ? (
              <LoaderCircle className="spin" size={28} />
            ) : (
              <Upload size={28} />
            )}
          </span>
          <strong>
            {busy
              ? "Membaca file…"
              : filename || "Klik atau tarik file Excel ke sini"}
          </strong>
          <small>.xlsx • Maksimal 5 MB / 2.000 baris</small>
        </button>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {preview && (
          <>
            <div className="import-stats">
              <span>
                <b>{preview.rows.length}</b>siap diimpor
              </span>
              <span>
                <b>{preview.duplicates}</b>duplikat dilewati
              </span>
              <span>
                <b>{preview.errors.length}</b>baris bermasalah
              </span>
            </div>
            {preview.errors.length > 0 ? (
              <div className="form-error">
                <strong>Perbaiki baris berikut sebelum impor:</strong>
                <ul>
                  {preview.errors.slice(0, 8).map((e) => (
                    <li key={e.row}>
                      Baris {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
                {preview.errors.length > 8 && (
                  <span>Dan {preview.errors.length - 8} baris lainnya.</span>
                )}
              </div>
            ) : (
              <p className="import-ok">
                <CheckCircle2 size={16} /> Pemeriksaan selesai. Data siap
                disimpan.
              </p>
            )}
          </>
        )}
        {demo && (
          <p className="form-hint">
            Mode demo: gunakan data contoh. Data hanya berada di memori tab ini.
          </p>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn secondary" disabled={busy} onClick={onClose}>
          Batal
        </button>
        <button
          className="btn primary"
          disabled={busy || !preview?.rows.length || !!preview?.errors.length}
          onClick={apply}
        >
          <Upload size={16} /> Impor {preview?.rows.length || ""} akun
        </button>
      </div>
    </ModalFrame>
  );
}
function Settings({ demo, email, theme, onThemeToggle }) {
  return (
    <div className="settings-grid">
      <section className="panel settings-panel">
        <h2>Informasi workspace</h2>
        <p>Pengaturan dasar untuk operasional Orinimo.</p>
        <dl>
          <div>
            <dt>Workspace</dt>
            <dd>Orinimo</dd>
          </div>
          <div>
            <dt>Akun admin</dt>
            <dd>{demo ? "Demo Admin" : email}</dd>
          </div>
          <div>
            <dt>Penyimpanan</dt>
            <dd>{demo ? "Demo · memori tab" : "Supabase"}</dd>
          </div>
          <div>
            <dt>Zona waktu</dt>
            <dd>Asia/Makassar (WITA)</dd>
          </div>
        </dl>
      </section>
      <section className="panel settings-panel theme-settings">
        <h2>Tampilan</h2>
        <p>Pilih tampilan yang nyaman untuk workspace.</p>
        <div className="theme-setting-row">
          <span>
            <Iconify
              icon={theme === "dark" ? moon : sun}
              width={18}
              height={18}
            />
            <strong>Mode {theme === "dark" ? "gelap" : "terang"}</strong>
          </span>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
      </section>
      <section className="panel settings-panel">
        <h2>Aturan reminder</h2>
        <p>Reminder dihitung otomatis dari tanggal akun.</p>
        <dl>
          <div>
            <dt>Netflix bulanan</dt>
            <dd>H−3 sebelum reset</dd>
          </div>
          <div>
            <dt>Netflix mingguan</dt>
            <dd>H−2 sebelum habis</dd>
          </div>
          <div>
            <dt>Disney+</dt>
            <dd>H−3 sebelum reset</dd>
          </div>
          <div>
            <dt>Jadwal terlewat</dt>
            <dd>Tetap tampil sampai diperbarui</dd>
          </div>
        </dl>
        <div className="form-hint">
          <Bell size={17} /> Reminder tampil di aplikasi. Tidak mengirim
          WhatsApp atau email.
        </div>
      </section>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
