import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const FEATURES = [
  {
    icon: '🔬',
    title: 'AI-Powered Analysis',
    desc: 'ConvNeXt-Base deep learning model trained on 25,000+ dermoscopy images achieves 88% accuracy across 8 disease classes.',
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

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex
          items-center justify-between h-16">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br
              from-sky-500 to-cyan-400 flex items-center justify-center
              text-white font-bold text-sm shadow-md">SS</div>
            <span className={`font-bold text-lg tracking-tight transition-colors
              ${scrolled ? 'text-slate-800' : 'text-white'}`}>
              SkinSight
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features','How It Works','About'].map(item => (
              <a key={item}
                href={`#${item.toLowerCase().replace(/ /g,'-')}`}
                className={`text-sm font-medium transition-colors
                  ${scrolled ? 'text-slate-600 hover:text-sky-600'
                             : 'text-white/80 hover:text-white'}`}>
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className={`text-sm font-medium px-4 py-2 rounded-lg
                transition-colors
                ${scrolled ? 'text-slate-700 hover:bg-slate-100'
                           : 'text-white hover:bg-white/10'}`}>
              Sign In
            </Link>
            <Link to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg
                bg-gradient-to-r from-sky-500 to-cyan-400 text-white
                shadow hover:shadow-lg hover:-translate-y-0.5
                transition-all duration-200">
              Get Started
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 text-xl
              ${scrolled ? 'text-slate-800' : 'text-white'}`}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100
            shadow-lg px-4 py-4 space-y-2">
            {['Features','How It Works','About'].map(item => (
              <a key={item}
                href={`#${item.toLowerCase().replace(/ /g,'-')}`}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-slate-600 font-medium
                  hover:text-sky-600 transition-colors">
                {item}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-slate-100">
              <Link to="/login"
                className="text-center py-2.5 rounded-lg border
                  border-slate-200 text-slate-700 font-medium">
                Sign In
              </Link>
              <Link to="/register"
                className="text-center py-2.5 rounded-lg
                  bg-gradient-to-r from-sky-500 to-cyan-400
                  text-white font-semibold shadow">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center
        bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 overflow-hidden">

        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px,rgba(255,255,255,0.8) 1px,transparent 0)', backgroundSize:'36px 36px' }}/>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"/>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5
                rounded-full bg-sky-500/20 border border-sky-500/30
                text-sky-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"/>
                AI-Powered Medical Screening
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold
                text-white leading-[1.1] mb-6">
                Skin Disease<br/>
                <span className="text-transparent bg-clip-text
                  bg-gradient-to-r from-sky-400 to-cyan-300">
                  Screening &
                </span><br/>
                Clinical Review
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
                Upload a skin lesion image and receive an AI-powered preliminary
                analysis reviewed by licensed dermatologists. Fast, accurate, and
                clinically validated.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/register"
                  className="inline-flex items-center justify-center gap-2
                    px-7 py-3.5 rounded-xl font-semibold text-white
                    bg-gradient-to-r from-sky-500 to-cyan-400
                    shadow-lg shadow-sky-500/30 hover:-translate-y-0.5
                    hover:shadow-sky-500/50 transition-all duration-200">
                  Start Free Screening →
                </Link>
                <a href="#how-it-works"
                  className="inline-flex items-center justify-center
                    px-7 py-3.5 rounded-xl font-medium text-slate-300
                    border border-slate-600 hover:border-slate-400
                    hover:text-white transition-all duration-200">
                  See How It Works
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATS.map(s => (
                  <div key={s.label}
                    className="bg-white/5 rounded-xl p-3 border
                      border-white/10 text-center">
                    <div className="text-2xl font-bold text-white font-mono">
                      {s.value}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock result card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl
                border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br
                    from-sky-400 to-cyan-300 flex items-center justify-center
                    text-white font-bold text-sm">JP</div>
                  <div>
                    <div className="text-white font-semibold text-sm">Case #1042</div>
                    <div className="text-slate-400 text-xs">Submitted 2 minutes ago</div>
                  </div>
                  <span className="ml-auto px-2.5 py-1 rounded-full text-xs
                    font-semibold bg-emerald-500/20 text-emerald-300
                    border border-emerald-500/30">Released</span>
                </div>

                <div className="rounded-xl overflow-hidden mb-5 h-44
                  bg-gradient-to-br from-slate-700 to-slate-800
                  flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full opacity-60 blur-sm"
                      style={{ background:'radial-gradient(circle, #ef4444 0%, #f59e0b 40%, #3b82f6 80%)' }}/>
                  </div>
                  <div className="relative z-10 bg-black/30 backdrop-blur-sm
                    px-3 py-1.5 rounded-lg text-white/80 text-xs font-medium">
                    Grad-CAM Heatmap
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label:'AI Prediction', value:'Melanocytic Nevi', type:'text' },
                    { label:'Confidence',    value:'82%',              type:'bar' },
                    { label:'Severity',      value:'MODERATE',         type:'badge' },
                    { label:'Doctor Review', value:'✓ Confirmed',      type:'success' },
                  ].map(row => (
                    <div key={row.label}
                      className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">{row.label}</span>
                      {row.type === 'text' &&
                        <span className="text-white font-semibold text-sm">{row.value}</span>}
                      {row.type === 'bar' && (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"/>
                          </div>
                          <span className="text-white text-sm font-mono">{row.value}</span>
                        </div>
                      )}
                      {row.type === 'badge' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold
                          bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {row.value}
                        </span>
                      )}
                      {row.type === 'success' && (
                        <span className="text-emerald-400 text-sm font-semibold">{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── Disease tags ── */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-semibold uppercase
            tracking-widest mb-5">Detects 8 skin disease classes</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {DISEASES.map(d => (
              <span key={d} className="px-4 py-2 rounded-full border
                border-slate-200 text-slate-600 text-sm font-medium
                bg-slate-50 hover:border-sky-300 hover:text-sky-600
                hover:bg-sky-50 transition-colors cursor-default">
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              A complete clinical screening workflow from image upload to
              doctor-reviewed diagnosis.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm
                border border-slate-100 hover:shadow-md hover:border-sky-100
                hover:-translate-y-1 transition-all duration-200 group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2
                  group-hover:text-sky-600 transition-colors">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-500 text-lg">
              Five steps from image submission to clinically-reviewed diagnosis.
            </p>
          </div>
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-5 items-start bg-slate-50
                rounded-2xl p-5 border border-slate-100
                hover:border-sky-100 hover:bg-sky-50/30 transition-all">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl
                  bg-gradient-to-br ${step.color} flex items-center
                  justify-center text-white font-bold shadow-md`}>
                  {step.num}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800">{step.title}</h3>
                    <span className="text-xs font-medium px-2 py-0.5
                      rounded-full bg-white border border-slate-200
                      text-slate-500">{step.role}</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-20 bg-gradient-to-br
        from-slate-900 to-sky-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize:'32px 32px' }}/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                About SkinSight
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                SkinSight is an AI-powered skin disease screening and clinical
                review system developed as a final year academic project in
                Computer Science and Medical Informatics.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                The system combines ConvNeXt-Base deep learning trained on the
                ISIC 2019 dermoscopy dataset with a structured clinical review
                workflow where human doctors validate every AI prediction before
                it reaches the patient.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Our goal is not to replace dermatologists but to assist them
                with fast, explainable AI screening that helps prioritize cases
                and surface potential diagnoses for expert review.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon:'🎓', title:'Academic Project', desc:'Final year CS project combining AI, healthcare, and software engineering' },
                { icon:'🧠', title:'Deep Learning',    desc:'ConvNeXt-Base with GeM pooling, trained on ISIC 2019 dermoscopy dataset' },
                { icon:'👨‍⚕️', title:'Doctor-in-Loop',  desc:'Every AI result reviewed and validated by a licensed clinician' },
                { icon:'📊', title:'Explainable AI',   desc:'Grad-CAM heatmaps make the AI decision transparent and trustworthy' },
              ].map((c, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm
                  rounded-xl p-5 border border-white/20">
                  <div className="text-2xl mb-3">{c.icon}</div>
                  <h4 className="text-white font-semibold text-sm mb-1">{c.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-500 text-lg mb-8">
            Create a free account and submit your first skin lesion image
            for AI-powered screening today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2
                px-8 py-4 rounded-xl font-semibold text-white text-lg
                bg-gradient-to-r from-sky-500 to-cyan-400
                shadow-lg shadow-sky-200 hover:-translate-y-0.5
                hover:shadow-sky-300 transition-all duration-200">
              Create Free Account →
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center
                px-8 py-4 rounded-xl font-semibold text-slate-700 text-lg
                border-2 border-slate-200 hover:border-sky-300
                hover:text-sky-600 transition-all duration-200">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center
            justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br
                from-sky-500 to-cyan-400 flex items-center justify-center
                text-white font-bold text-xs">SS</div>
              <span className="text-white font-bold">SkinSight</span>
            </div>
            <p className="text-slate-500 text-sm text-center">
              AI Skin Disease Screening & Clinical Review System.
              For educational purposes only.
            </p>
            <p className="text-slate-600 text-xs">© 2026 SkinSight</p>
          </div>
        </div>
      </footer>
    </div>
  )
}