"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TrendingUp, LineChart, Sparkles, Shield, Zap, CheckCircle2, Menu, X, BarChart3, Activity } from "lucide-react";
import '../app/globals.css';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Get intelligent market predictions powered by Google's Gemini AI technology"
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: "Real-Time Data",
      description: "Live market updates with comprehensive charts and technical indicators"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Smart Signals",
      description: "Receive automated buy/sell signals and track your portfolio performance"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Trading",
      description: "Your data protected with enterprise-level security standards"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Fast Performance",
      description: "Lightning-quick execution for time-sensitive trading opportunities"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Tools",
      description: "Professional-grade analytics used by thousands of successful traders"
    }
  ];

  const stats = [
    { value: "45K+", label: "Active Users" },
    { value: "₹2.3B+", label: "Volume Traded" },
    { value: "99.8%", label: "Uptime" },
    { value: "4.8", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg blur-sm opacity-60 group-hover:opacity-80 transition" />
                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xl font-semibold">Fintola</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm text-slate-400 hover:text-white transition">Features</Link>
              <Link href="#about" className="text-sm text-slate-400 hover:text-white transition">About</Link>
              <Link href="/dash" className="relative px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-sm font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20">
                Dashboard
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/50">
            <div className="px-4 py-6 space-y-3">
              <Link href="#features" className="block text-slate-300 hover:text-white transition py-2" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="#about" className="block text-slate-300 hover:text-white transition py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link href="/dash" className="block w-full px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-center font-medium mt-4" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <motion.div style={{ opacity, scale }} className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-emerald-400">AI-Powered Trading Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }} 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            Make Better
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Trading Decisions
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }} 
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Professional stock analysis platform with AI insights, real-time data, and advanced charting tools. Everything you need to trade smarter.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.3 }} 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/sign-in" className="group px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-base font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25">
              <span className="flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </span>
            </Link>
            <Link href="#features" className="px-8 py-3.5 rounded-lg text-base font-medium border border-slate-700 hover:border-slate-600 hover:bg-slate-900/50 transition-all">
              Learn More
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.6, delay: 0.5 }} 
            className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No credit card needed</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/3 -left-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -right-40 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl" />
        </div>
      </section>

      <section className="relative py-16 px-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: index * 0.1 }} 
                viewport={{ once: true }} 
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            viewport={{ once: true }} 
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for Traders
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              All the tools you need in one place
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: index * 0.1 }} 
                viewport={{ once: true }} 
                className="group p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all hover:bg-slate-900/80"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-500 mb-4 group-hover:bg-emerald-500/20 transition">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose Fintola?
            </h2>
            <p className="text-lg text-slate-400 mb-12 leading-relaxed">
              We combine cutting-edge AI technology with real-time market data to give you an edge in trading. Whether you're just starting out or you're a seasoned trader, our platform adapts to your needs.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Intelligence</h3>
                <p className="text-slate-400 text-sm">Powered by Google Gemini for accurate predictions</p>
              </div>
              <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Speed</h3>
                <p className="text-slate-400 text-sm">Instant updates from global markets</p>
              </div>
              <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Platform</h3>
                <p className="text-slate-400 text-sm">Enterprise-grade data protection</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-lg text-slate-400 mb-10">
              Join thousands of traders who trust Fintola every day
            </p>
            <Link href="/sign-in" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-base font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25">
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="relative border-t border-slate-800/50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold">Fintola</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <Link href="#" className="hover:text-white transition">Privacy</Link>
              <Link href="#" className="hover:text-white transition">Terms</Link>
              <Link href="#" className="hover:text-white transition">Contact</Link>
              <Link href="#" className="hover:text-white transition">Support</Link>
            </div>

            <div className="text-sm text-slate-500">
              © 2025 Fintola
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
