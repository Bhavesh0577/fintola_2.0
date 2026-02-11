"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, TrendingUp, LineChart, Sparkles, Shield,
  Menu, X, BarChart3, Activity, Wallet, Bot, Globe,
  ArrowUpRight, Users, Clock, Lock
} from "lucide-react";
import "../app/globals.css";

/* ── Animated number counter ── */
function Counter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1800;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Minimal hero chart ── */
function HeroChart() {
  return (
    <svg viewBox="0 0 400 100" fill="none" className="w-full h-auto">
      <defs>
        <linearGradient id="line-g" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5b4fc" stopOpacity="0.6" />
          <stop offset="1" stopColor="#818cf8" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="fill-g" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" stopOpacity="0.08" />
          <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0 80 C40 75 60 65 100 52 S160 38 200 35 S260 30 300 22 S360 18 400 12"
        stroke="url(#line-g)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.2, delay: 1, ease: "easeOut" }}
      />
      <motion.path
        d="M0 80 C40 75 60 65 100 52 S160 38 200 35 S260 30 300 22 S360 18 400 12 L400 100 L0 100 Z"
        fill="url(#fill-g)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      />
    </svg>
  );
}

/* ── Dashboard mockup ── */
function DashboardMockup() {
  const cards = [
    { label: "Portfolio", val: "₹12,45,230", delta: "+2.4%", up: true },
    { label: "Today P&L", val: "₹8,420", delta: "+0.68%", up: true },
    { label: "Paper Balance", val: "₹9,56,000", delta: "−1.2%", up: false },
    { label: "Status", val: "Market Open", delta: "NSE", up: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-5xl mt-10 sm:mt-20 px-2 sm:px-4"
    >
      {/* Outer glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent" />
      <div className="absolute -inset-8 bg-indigo-500/[0.04] rounded-3xl blur-3xl pointer-events-none" />

      <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0e14]/90 backdrop-blur-2xl overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 sm:px-16 py-1 rounded-md bg-white/[0.03] text-[10px] sm:text-[11px] text-white/20 font-mono tracking-wide truncate">
              fintola.vercel.app/dash
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {cards.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3.5"
              >
                <div className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider font-medium">{c.label}</div>
                <div className="text-sm font-semibold text-white/90">{c.val}</div>
                <div className={`text-[10px] mt-1 font-medium ${c.up ? "text-indigo-400" : "text-rose-400/80"}`}>
                  {c.delta}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="rounded-xl bg-white/[0.015] border border-white/[0.04] p-5 h-28">
            <HeroChart />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════ */
/*             MAIN PAGE                 */
/* ══════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 30 });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const features = [
    { icon: <Sparkles className="w-[18px] h-[18px]" />, title: "AI-Powered Analysis", desc: "Gemini AI delivers deep technical & fundamental analysis with actionable insights.", tag: "AI" },
    { icon: <LineChart className="w-[18px] h-[18px]" />, title: "Real-Time Charts", desc: "Professional candlestick charts with live feeds, multiple timeframes, and indicators.", tag: "Live" },
    { icon: <Wallet className="w-[18px] h-[18px]" />, title: "Portfolio Tracker", desc: "Track real holdings with live P&L, market value, and historical performance.", tag: "New" },
    { icon: <TrendingUp className="w-[18px] h-[18px]" />, title: "Paper Trading", desc: "Practice strategies risk-free with ₹10L virtual capital and full trade history.", tag: "New" },
    { icon: <Bot className="w-[18px] h-[18px]" />, title: "Smart Signals", desc: "Automated buy/sell signals with confidence scores and indicator breakdowns.", tag: "Pro" },
    { icon: <Globe className="w-[18px] h-[18px]" />, title: "Multi-Market", desc: "NSE, BSE Indian stocks plus global crypto — all from a single dashboard.", tag: "Global" },
  ];

  const stats = [
    { value: 45000, suffix: "+", label: "Active Traders", icon: <Users className="w-4 h-4" /> },
    { value: 230, prefix: "₹", suffix: "Cr+", label: "Volume Tracked", icon: <BarChart3 className="w-4 h-4" /> },
    { value: 99, suffix: ".8%", label: "Uptime", icon: <Clock className="w-4 h-4" /> },
    { value: 48, suffix: "/5", label: "Rating", icon: <Activity className="w-4 h-4" /> },
  ];

  const steps = [
    { n: "01", title: "Create Account", desc: "Sign up in seconds with secure authentication." },
    { n: "02", title: "Add Holdings", desc: "Import your portfolio or start with paper trading." },
    { n: "03", title: "Get AI Insights", desc: "Receive real-time analysis and smart signals." },
  ];

  const fade = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] } }),
  };

  const navLinks = ["Features", "How it Works", "About"];

  return (
    <div className="min-h-screen bg-[#08090d] text-white/90 antialiased selection:bg-indigo-500/25">
      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-px bg-white/20 z-[100] origin-left" style={{ scaleX: smoothProgress }} />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,_rgba(99,102,241,0.06),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#08090d]/80 backdrop-blur-2xl border-b border-white/[0.04]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.07] group-hover:bg-white/[0.1] transition">
                <TrendingUp className="w-3.5 h-3.5 text-white/70" />
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-white/90">Fintola</span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="px-3.5 py-1.5 text-[13px] text-white/40 hover:text-white/80 rounded-md hover:bg-white/[0.04] transition-all"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/sign-in" className="px-3.5 py-1.5 text-[13px] text-white/40 hover:text-white/70 transition">
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-1.5 text-[13px] font-medium rounded-lg bg-white text-[#08090d] hover:bg-white/90 transition-all"
              >
                Get Started
              </Link>
            </div>

            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-1.5 rounded-md hover:bg-white/[0.05] transition">
              {mobileNav ? <X className="w-5 h-5 text-white/60" /> : <Menu className="w-5 h-5 text-white/60" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#08090d]/98 backdrop-blur-2xl border-t border-white/[0.04] overflow-hidden"
            >
              <div className="px-5 py-5 space-y-1">
                {navLinks.map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                    className="block px-3 py-2.5 text-[14px] text-white/50 hover:text-white/80 rounded-lg hover:bg-white/[0.04] transition"
                    onClick={() => setMobileNav(false)}
                  >
                    {item}
                  </Link>
                ))}
                <div className="pt-3 space-y-2">
                  <Link href="/sign-in" className="block px-3 py-2.5 text-center text-[14px] text-white/50 border border-white/[0.06] rounded-lg" onClick={() => setMobileNav(false)}>
                    Log in
                  </Link>
                  <Link href="/sign-up" className="block px-3 py-2.5 text-center text-[14px] font-medium bg-white text-[#08090d] rounded-lg" onClick={() => setMobileNav(false)}>
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-8 px-5">
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.03] mb-8"
          >
            <div className="relative w-1.5 h-1.5">
              <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-50" />
              <div className="relative w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>
            <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Now with AI Analysis</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-5"
          >
            The modern way
            <br />
            <span className="text-white/40">to trade Indian markets</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[15px] sm:text-base text-white/35 mb-9 max-w-lg mx-auto leading-relaxed"
          >
            Real-time data, AI insights, portfolio tracking, and paper trading
            — everything you need, in one clean platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/sign-up"
              className="group w-full sm:w-auto px-7 py-2.5 rounded-lg text-[14px] font-medium bg-white text-[#08090d] hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              Start for Free
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/dash"
              className="w-full sm:w-auto px-7 py-2.5 rounded-lg text-[14px] font-medium border border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/[0.14] hover:bg-white/[0.03] transition-all flex items-center justify-center gap-2"
            >
              View Dashboard
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-5 text-[12px] text-white/25"
          >
            {["Free forever", "No credit card", "Secure by default"].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>{t}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <DashboardMockup />

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#08090d] to-transparent pointer-events-none" />
      </section>

      {/* ── Stats ── */}
      <section className="relative py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                variants={fade}
                className="bg-[#08090d] p-7 text-center"
              >
                <div className="text-white/15 mb-3 flex justify-center">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-white/85 mb-1 tabular-nums">
                  <Counter value={s.value} suffix={s.suffix} prefix={s.prefix || ""} />
                </div>
                <div className="text-[12px] text-white/25 uppercase tracking-wider font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative py-28 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} custom={0} variants={fade} className="text-center mb-14">
            <p className="text-[11px] font-medium text-white/25 uppercase tracking-[0.2em] mb-3">Platform</p>
            <h2 className="text-3xl md:text-[2.6rem] font-bold tracking-tight mb-3">
              Everything you need
            </h2>
            <p className="text-[15px] text-white/30 max-w-md mx-auto">
              Professional-grade tools for the Indian and global markets.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                variants={fade}
                className="group bg-[#08090d] hover:bg-white/[0.015] p-7 transition-colors duration-300 cursor-default"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] text-white/40 group-hover:text-white/60 group-hover:bg-white/[0.07] transition-all">
                    {f.icon}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-semibold text-white/25 uppercase tracking-wider border border-white/[0.06]">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-white/80 mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-white/30 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="relative py-28 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} custom={0} variants={fade} className="text-center mb-14">
            <p className="text-[11px] font-medium text-white/25 uppercase tracking-[0.2em] mb-3">Getting Started</p>
            <h2 className="text-3xl md:text-[2.6rem] font-bold tracking-tight mb-3">
              Three simple steps
            </h2>
            <p className="text-[15px] text-white/30 max-w-md mx-auto">
              From sign-up to your first AI insight in under two minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                variants={fade}
                className="bg-[#08090d] p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-5">
                  <span className="text-lg font-bold text-white/20">{s.n}</span>
                </div>
                <h3 className="text-[15px] font-semibold text-white/80 mb-1.5">{s.title}</h3>
                <p className="text-[13px] text-white/30 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About / Why Fintola ── */}
      <section id="about" className="relative py-28 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} custom={0} variants={fade}>
              <p className="text-[11px] font-medium text-white/25 uppercase tracking-[0.2em] mb-3">Why Fintola</p>
              <h2 className="text-3xl md:text-[2.6rem] font-bold tracking-tight mb-5 leading-tight">
                Built for traders
                <br />
                <span className="text-white/35">who take it seriously</span>
              </h2>
              <p className="text-[14px] text-white/30 leading-relaxed mb-8">
                We combine cutting-edge AI with real-time market data to give you an edge. Whether you&apos;re just getting started or you&apos;re a seasoned professional, Fintola adapts to your style.
              </p>

              <div className="space-y-3">
                {[
                  { icon: <Sparkles className="w-4 h-4" />, title: "Gemini AI Analysis", desc: "Deep technical & fundamental analysis in seconds" },
                  { icon: <Activity className="w-4 h-4" />, title: "Real-Time Everything", desc: "Live prices, live charts, live portfolio P&L" },
                  { icon: <Shield className="w-4 h-4" />, title: "Enterprise Security", desc: "Clerk auth + Supabase RLS — your data stays yours" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    custom={i + 1}
                    variants={fade}
                    className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.025] transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] text-white/35 flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-white/75 mb-0.5">{item.title}</h4>
                      <p className="text-[12px] text-white/25">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grid grid-cols-2 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
                {[
                  { icon: <BarChart3 className="w-6 h-6" />, label: "Advanced Charts" },
                  { icon: <Bot className="w-6 h-6" />, label: "AI Predictions" },
                  { icon: <Wallet className="w-6 h-6" />, label: "Portfolio Track" },
                  { icon: <Globe className="w-6 h-6" />, label: "Multi Market" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="bg-[#08090d] aspect-square flex flex-col items-center justify-center gap-3 group hover:bg-white/[0.015] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-white/25 group-hover:text-white/45 group-hover:bg-white/[0.07] transition-all">
                      {item.icon}
                    </div>
                    <span className="text-[13px] font-medium text-white/30 group-hover:text-white/50 transition-colors">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 px-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_50%,_rgba(99,102,241,0.04),transparent)] pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} custom={0} variants={fade}>
            <h2 className="text-3xl md:text-[2.8rem] font-bold tracking-tight mb-4 leading-tight">
              Ready to start?
            </h2>
            <p className="text-[15px] text-white/30 mb-9 max-w-sm mx-auto">
              Join thousands of traders making smarter, data-driven decisions every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="group w-full sm:w-auto px-8 py-3 rounded-lg text-[14px] font-medium bg-white text-[#08090d] hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                Create Free Account
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/dash"
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-[14px] font-medium border border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.14] hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2"
              >
                Explore Dashboard
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative border-t border-white/[0.04] py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.07]">
                  <TrendingUp className="w-3.5 h-3.5 text-white/60" />
                </div>
                <span className="text-[15px] font-semibold text-white/80">Fintola</span>
              </div>
              <p className="text-[12px] text-white/20 leading-relaxed">
                AI-powered stock analysis and portfolio tracking for the modern Indian trader.
              </p>
            </div>
            {[
              { title: "Platform", links: [{ name: "Dashboard", href: "/dash" }, { name: "Portfolio", href: "/portfolio" }, { name: "Trading", href: "/trading" }] },
              { title: "Resources", links: [{ name: "Features", href: "#features" }, { name: "How it Works", href: "#how-it-works" }, { name: "About", href: "#about" }] },
              { title: "Legal", links: [{ name: "Privacy", href: "#" }, { name: "Terms", href: "#" }, { name: "Contact", href: "#" }] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-[13px] text-white/20 hover:text-white/45 transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-[12px] text-white/15">© {new Date().getFullYear()} Fintola</span>
            <span className="text-[12px] text-white/15">Built for Indian traders</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
