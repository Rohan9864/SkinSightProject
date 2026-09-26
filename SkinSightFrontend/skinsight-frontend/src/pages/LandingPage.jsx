import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Logo from '../components/common/Logo'
import heroGraphic from '../assets/hero.png'

const FEATURES = [
  {
    icon: '🔬',
    title: 'AI-Powered Analysis',
    desc: 'ConvNeXt-Base deep learning model trained on 25,000+ dermoscopy images achieves very high accuracy across 8 disease classes.',
  },
  {
    icon: '🩺',
    title: 'Clinical Review Workflow',
    desc: 'Every AI prediction is reviewed by a licensed dermatologist who can confirm, override, or request resubmission.',
  },
  {
    icon: '🗺️',
    title: 'Grad-CAM Heatmaps',
    desc: 'Visual explanations show which regions of the skin lesion the AI focused on — transparent and interpretable.',
  },
  {
    icon: '📋',
    title: 'Detailed PDF Reports',
    desc: 'Comprehensive medical report with AI diagnosis, confidence scores, heatmap visualization and doctor clinical notes.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'JWT-based authentication, role-based access control and encrypted data storage keep your records protected.',
  },
  {
    icon: '🔔',
    title: 'Real-Time Notifications',
    desc: 'In-app and email alerts keep you informed at every stage — from AI analysis to final doctor release.',
  },
]

const STEPS = [
  { num: '01', role: 'Patient',  color: 'from-sky-500 to-cyan-400',     title: 'Submit Your Image',  desc: 'Upload a clear photo of the skin lesion along with a brief description. JPG and PNG accepted up to 10MB.' },
  { num: '02', role: 'AI',       color: 'from-violet-500 to-purple-400', title: 'Instant AI Analysis', desc: 'ConvNeXt-Base model analyzes the image within seconds and generates a Grad-CAM attention heatmap.' },
  { num: '03', role: 'Admin',    color: 'from-amber-500 to-orange-400',  title: 'Case Assignment',    desc: 'An administrator assigns your case to an available dermatologist for clinical review.' },
  { num: '04', role: 'Doctor',   color: 'from-emerald-500 to-teal-400',  title: 'Clinical Review',    desc: 'A licensed doctor examines the AI prediction alongside your image then confirms or overrides the diagnosis.' },
  { num: '05', role: 'Patient',  color: 'from-rose-500 to-pink-400',     title: 'View Your Results',  desc: 'Receive your final diagnosis, clinical notes, and a downloadable PDF report once the doctor releases it.' },
]

const DISEASES = [
  'Melanoma', 'Melanocytic Nevi', 'Basal Cell Carcinoma',
  'Actinic Keratosis', 'Benign Keratosis',
  'Dermatofibroma', 'Vascular Lesion', 'Squamous Cell Carcinoma',
]

const STATS = [
  { value: '88%',   label: 'AI Accuracy' },
  { value: '8',     label: 'Disease Classes' },
  { value: '25K+',  label: 'Training Images' },
  { value: '<10s',  label: 'Analysis Time' },
]

const HOW_IT_WORKS_SIMPLE = [
  { icon: '📤', title: 'Upload', desc: 'Submit a skin lesion image' },
  { icon: '🤖', title: 'Analyze', desc: 'AI generates preliminary screening' },
  { icon: '✓', title: 'Screen', desc: 'System creates diagnostic prediction' },
  { icon: '👨‍⚕️', title: 'Clinical Review', desc: 'Dermatologist reviews findings' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">{/* Changed base background to dark */}

      {/* ── Improved Navbar ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Logo size="md" />
            <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">
              SkinSight
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {['Features','How It Works','About'].map(item => (
              <a key={item}
                href={`#${item.toLowerCase().replace(/ /g,'-')}`}
                className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-medium px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200">
              Sign In
            </Link>
            <Link to="/register"
              className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-xl text-white hover:text-cyan-400 transition-colors">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800/50 px-4 py-4 space-y-3">
            {['Features','How It Works','About'].map(item => (
              <a key={item}
                href={`#${item.toLowerCase().replace(/ /g,'-')}`}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-slate-300 font-medium hover:text-cyan-400 transition-colors">
                {item}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2.5 border-t border-slate-800">
              <Link to="/login"
                className="text-center py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium hover:border-slate-600 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/register"
                className="text-center py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Improved Hero Section ── */}
      <section className="relative min-h-screen flex items-center pt-16
        bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 overflow-hidden">

        {/* Animated background */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px,rgba(148,163,184,0.3) 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>
        <div className="absolute top-20 -right-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl"/>

        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen">
            {/* Left Column: Hero Content */}
            <div className="space-y-8 order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wide w-fit">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/>
                AI-Powered Medical Screening
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  Skin Disease<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-cyan-200">
                    Screening &
                  </span><br/>
                  Clinical Review
                </h1>
              </div>

              {/* Description */}
              <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
                Combine AI-powered preliminary screening with expert dermatologist review. Fast, accurate, and clinically sound.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-950 text-base bg-gradient-to-r from-sky-400 to-cyan-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-200">
                  Start Free Screening →
                </Link>
                <a href="#how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-slate-200 border-2 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/30 transition-all duration-200">
                  How It Works
                </a>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-800">
                {/* <div className="space-y-1">
                  <div className="text-3xl font-bold text-cyan-300">88%</div>
                  <div className="text-sm text-slate-400">AI Accuracy</div>
                </div> */}
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-cyan-300">25K+</div>
                  <div className="text-sm text-slate-400">Training Images</div>
                </div>
              </div>
            </div>

            {/* Right Column: Product Preview */}
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-cyan-400/10 rounded-3xl blur-3xl -z-10"/>
                
                {/* Featured Graphic */}
                <img
                  src={heroGraphic}
                  alt="SkinSight AI Analysis Dashboard"
                  className="w-full rounded-3xl shadow-2xl shadow-cyan-500/20 border border-slate-700/50 backdrop-blur-sm object-cover"
                />
                
                {/* Info badge */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-3 flex items-center gap-3 backdrop-blur-sm shadow-xl">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"/>
                  <span className="text-sm font-medium text-slate-300">AI Analysis in {"<10s"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 Q360,80 720,40 T1440,40 L1440,120 L0,120 Z" fill="rgb(15,23,42)" opacity="0.5"/>
          </svg>
        </div>
      </section>

      <div className="relative h-14 bg-white overflow-hidden">
        <div className="absolute inset-x-[8%] top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_22px_rgba(34,211,238,0.9)] animate-pulse" />
      </div>

      {/* ── Disease Detection Showcase ── */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600 mb-3">Detects 8 Disease Classes</p>
            <h3 className="text-2xl font-bold text-slate-900">Comprehensive Skin Disease Detection</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {DISEASES.map(d => (
              <span key={d} className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-medium bg-slate-50 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200 cursor-default">
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="relative h-14 bg-white overflow-hidden">
        <div className="absolute inset-x-[8%] top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_22px_rgba(34,211,238,0.9)] animate-pulse" />
      </div>

      {/* ── Improved Features Section ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Built for Smarter Screening
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Every component designed to support accurate AI-assisted skin disease screening with clinical oversight.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/10 hover:-translate-y-1">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/0 to-sky-50/0 group-hover:from-cyan-50/50 group-hover:to-sky-50/30 rounded-2xl transition-all duration-300"/>
                
                <div className="relative">
                  <div className="text-4xl mb-4 block">{f.icon}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-3 group-hover:text-cyan-600 transition-colors">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative h-14 bg-white overflow-hidden">
        <div className="absolute inset-x-[8%] top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_22px_rgba(34,211,238,0.9)] animate-pulse" />
      </div>

      {/* ── How SkinSight Works (Simplified Overview) ── */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              How SkinSight Works
            </h2>
            <p className="text-xl text-slate-400">
              From image upload to clinical insight in four essential steps
            </p>
          </div>

          {/* Simplified 4-step flow */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {HOW_IT_WORKS_SIMPLE.map((step, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl">
                    {step.icon}
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="font-semibold text-white">{step.title}</h4>
                    <p className="text-sm text-slate-400">{step.desc}</p>
                  </div>
                </div>
                {i < HOW_IT_WORKS_SIMPLE.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-2 text-2xl text-slate-700">→</div>
                )}
              </div>
            ))}
          </div>

          {/* Detailed workflow section */}
          <div className="mt-20 pt-16 border-t border-slate-800">
            <h3 className="text-2xl font-bold text-white mb-12 text-center">Complete Workflow</h3>
            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all`}>
                    {step.num}
                  </div>
                  <div className="flex-1 bg-slate-800/40 border border-slate-700/50 group-hover:border-cyan-500/30 rounded-xl p-6 transition-all duration-200 group-hover:bg-slate-800/60">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white text-lg">{step.title}</h3>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-700 text-slate-300">{step.role}</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative h-14 bg-slate-50 overflow-hidden">
        <div className="absolute inset-x-[8%] top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_22px_rgba(34,211,238,0.9)] animate-pulse" />
      </div>

      {/* ── Responsible AI Section ── */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 border border-cyan-300">
              <span className="text-2xl text-cyan-600">✓</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900">
              AI-Assisted. Clinically Reviewed.
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              SkinSight is designed to support preliminary skin disease screening and clinical review. AI-generated results are intended to assist healthcare professionals, not replace professional medical judgment.
            </p>
            <p className="text-sm text-slate-600 pt-4 border-t border-slate-200">
              Every AI prediction undergoes review and validation by a qualified dermatologist before reaching patients.
            </p>
          </div>
        </div>
      </section>

      <div className="relative h-14 bg-white overflow-hidden">
        <div className="absolute inset-x-[8%] top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_22px_rgba(34,211,238,0.9)] animate-pulse" />
      </div>

      {/* ── About ── */}

      <section id="about" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px,rgba(15,23,42,0.5) 1px,transparent 1px)', backgroundSize:'32px 32px' }}/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900">
                About SkinSight
              </h2>
              <div className="space-y-4 text-slate-700">
                <p className="leading-relaxed">
                  SkinSight is an AI-powered skin disease screening and clinical review system developed as a final year academic project in Computer Science and Medical Informatics.
                </p>
                <p className="leading-relaxed">
                  The system combines ConvNeXt-Base deep learning trained on the ISIC dermoscopy dataset with a structured clinical review workflow where human doctors validate every AI prediction before it reaches the patient.
                </p>
                <p className="leading-relaxed">
                  Our goal is not to replace dermatologists but to assist them with fast, explainable AI screening that helps prioritize cases and surface potential diagnoses for expert review.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon:'🎓', title:'Academic Project', desc:'Final year CS project combining AI, healthcare, and software engineering' },
                { icon:'🧠', title:'Deep Learning',    desc:'ConvNeXt-Base with GeM pooling, trained on ISIC 2019 dermoscopy dataset' },
                { icon:'👨‍⚕️', title:'Doctor-in-Loop',  desc:'Every AI result reviewed and validated by a licensed clinician' },
                { icon:'📊', title:'Explainable AI',   desc:'Grad-CAM heatmaps make the AI decision transparent and trustworthy' },
              ].map((c, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200 hover:border-cyan-400 transition-all duration-200 group">
                  <div className="text-4xl mb-4">{c.icon}</div>
                  <h4 className="text-slate-900 font-semibold text-sm mb-2 group-hover:text-cyan-600 transition-colors">{c.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative h-14 bg-white overflow-hidden">
        <div className="absolute inset-x-[8%] top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_22px_rgba(34,211,238,0.9)] animate-pulse" />
      </div>

      {/* ── Final CTA Section ── */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900">
              Start Your Skin Screening
            </h2>
            <p className="text-xl text-slate-600">
              Upload a skin lesion image and begin your preliminary screening today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-semibold text-slate-950 text-lg bg-gradient-to-r from-sky-400 to-cyan-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-200">
              Start Free Screening →
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center px-10 py-4 rounded-xl font-semibold text-slate-700 border-2 border-slate-300 hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <div className="relative h-14 bg-white overflow-hidden">
        <div className="absolute inset-x-[8%] top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_22px_rgba(34,211,238,0.9)] animate-pulse" />
      </div>

      {/* ── Professional Footer ── */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-slate-800">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-lg bg-slate-800 p-1.5">
                  <Logo size="sm" showText={false} />
                </div>
                <span className="font-bold text-white text-lg">SkinSight</span>
              </div>
              <p className="text-sm text-slate-400">
                AI Skin Disease Screening & Clinical Review System
              </p>
            </div>

            {/* Navigation */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wide">Navigation</h4>
              <nav className="space-y-2">
                {['Features', 'How It Works', 'About'].map(item => (
                  <a key={item}
                    href={`#${item.toLowerCase().replace(/ /g,'-')}`}
                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors block">
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Auth Links */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wide">Account</h4>
              <nav className="space-y-2">
                <Link to="/login" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors block">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors block">
                  Create Account
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              © 2026 SkinSight. All rights reserved. For educational purposes.
            </p>
            <p className="text-xs text-slate-500 text-center">
              SkinSight provides AI-assisted preliminary screening and does not replace professional medical diagnosis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}