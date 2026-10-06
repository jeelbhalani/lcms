import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  Shield,
  Briefcase,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Award,
  ArrowRight,
  Gavel,
  Cpu,
  Building2,
  Users,
  Send,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface PublicWebsiteProps {
  onOpenApply: () => void;
  onOpenAuth: (mode: 'login' | 'register', role?: UserRole) => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({ onOpenApply, onOpenAuth }) => {
  const { websiteSettings, users, submitContactMessage } = useApp();

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessageText, setContactMessageText] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // FAQ Accordion state
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const lawyers = users.filter((u) => u.role === 'lawyer' && u.status === 'active');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessageText) return;

    submitContactMessage({
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      subject: contactSubject || 'General Legal Consultation Inquiry',
      message: contactMessageText,
    });

    setContactSent(true);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactSubject('');
    setContactMessageText('');
    setTimeout(() => setContactSent(false), 5000);
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scale':
        return <Scale className="w-6 h-6 text-amber-500" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-amber-500" />;
      case 'Building2':
        return <Building2 className="w-6 h-6 text-amber-500" />;
      case 'Users':
        return <Users className="w-6 h-6 text-amber-500" />;
      case 'Gavel':
        return <Gavel className="w-6 h-6 text-amber-500" />;
      default:
        return <Shield className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800">
      {/* 1. Hero Section */}
      <section className="relative bg-slate-950 text-white pt-16 pb-24 lg:pt-28 lg:pb-36 overflow-hidden border-b border-amber-950/40">
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600 rounded-full blur-[160px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Scale className="w-4 h-4" />
              <span>{websiteSettings.tagline}</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight text-white mb-6">
              {websiteSettings.heroHeading}
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 font-light leading-relaxed mb-10">
              {websiteSettings.heroSubheading}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenApply}
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm tracking-wide transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <span>{websiteSettings.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm transition flex items-center gap-2"
              >
                <span>{websiteSettings.secondaryCtaText}</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>

          {/* KPI Metrics Strip */}
          <div className="mt-16 sm:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-serif font-black text-amber-400">98.4%</div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mt-1">
                Trial &amp; Settlement Win Rate
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-serif font-black text-white">$1.8B+</div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mt-1">
                Recoveries &amp; Defended Assets
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-serif font-black text-white">2,400+</div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mt-1">
                Successfully Resolved Dockets
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-serif font-black text-amber-400">35+</div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mt-1">
                Federal Bar Certified Partners
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Practice Areas / Services */}
      <section id="services" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full">
              Jurisprudence Mastery
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-3 mb-4">
              Practice Areas &amp; Legal Capabilities
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We provide aggressive representation and strategic transactional guidance across federal courts, state
              appellate divisions, and international arbitrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {websiteSettings.services
              .filter((s) => s.active)
              .map((service) => (
                <div
                  key={service.id}
                  className="group bg-slate-50 hover:bg-white rounded-2xl p-7 border border-slate-200 hover:border-amber-400/80 transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                      {getServiceIcon(service.icon)}
                    </div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 mb-2.5 group-hover:text-amber-800 transition">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                      {service.description}
                    </p>
                  </div>

                  <button
                    onClick={onOpenApply}
                    className="text-xs font-bold text-slate-900 group-hover:text-amber-600 flex items-center gap-1.5 transition pt-2 border-t border-slate-200/80"
                  >
                    <span>Inquire for Representation</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* 3. About Us & Firm Heritage */}
      <section id="about" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Firm Heritage &amp; Ethos
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-4 mb-6">
                {websiteSettings.aboutTitle}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">{websiteSettings.aboutDescription}</p>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Our Mission</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{websiteSettings.mission}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Our Vision</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{websiteSettings.vision}</p>
                </div>
              </div>

              {/* Core Values */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Core Pillars:</h4>
                <div className="flex flex-wrap gap-2">
                  {websiteSettings.values.map((v, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-amber-300 border border-amber-500/20"
                    >
                      ✓ {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual block */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1000"
                  alt="Law Firm Library"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white">
                    <p className="font-serif font-bold text-sm text-amber-400">
                      Uncompromised Attorney-Client Fiduciary Standard
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      Our modern LCMS infrastructure ensures end-to-end transparent case docketing, military-grade document
                      security, and direct client visibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Attorneys / Legal Team */}
      <section id="attorneys" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full">
              Legal Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-3 mb-4">
              Partners &amp; Lead Counsel
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Distinguished litigators admitted to federal appellate bars, Supreme Court practice, and top-tier corporate
              reorganizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={lawyer.avatar}
                    alt={lawyer.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-sm text-amber-400 text-[10px] font-bold border border-slate-700">
                    Bar: {lawyer.barNumber}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 mb-1">{lawyer.name}</h3>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">
                      {lawyer.specialization} • {lawyer.experienceYears} Years Exp
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{lawyer.bio}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {lawyer.phone}
                    </span>
                    <button
                      onClick={onOpenApply}
                      className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      <span>Retain</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Attorney Registration Callout */}
          <div className="mt-12 p-6 bg-slate-900 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-white">
                  Are you an admitted attorney seeking to join our practice?
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Register as practicing counsel to assume active case dockets, file court pleadings, and represent clients through LCMS.
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenAuth('register', 'lawyer')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Register as Attorney</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Announcements / Legal Insights */}
      {websiteSettings.announcements.filter((a) => a.active).length > 0 && (
        <section className="py-16 bg-slate-100 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Docket Bulletins</span>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">Firm Announcements &amp; Precedents</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {websiteSettings.announcements
                .filter((a) => a.active)
                .map((ann) => (
                  <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{ann.date}</span>
                    </div>
                    <h4 className="text-base font-serif font-bold text-slate-900 mb-2">{ann.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. FAQ Accordion */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full">
              Client Knowledge Base
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mt-3 mb-2">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Clear guidance on case intake procedures, attorney-client privilege, and portal operations.
            </p>
          </div>

          <div className="space-y-3">
            {websiteSettings.faqs
              .filter((f) => f.active)
              .map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-200 rounded-xl overflow-hidden transition bg-slate-50/50"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:text-amber-800 transition"
                    >
                      <span className="font-serif">{faq.question}</span>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 shrink-0 text-xs font-bold transition transform ${
                          isOpen ? 'rotate-180 bg-amber-500 text-slate-950' : ''
                        }`}
                      >
                        ↓
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* 7. Contact Us & Consultation Form */}
      <section id="contact" className="py-20 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Info & Office Coordinates */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Direct Contact
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-4 mb-6">
                Consult With Senior Legal Counsel
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                For confidential inquiries, subpoena emergencies, or corporate litigation reviews, connect directly with
                our managing partners.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Headquarters</h4>
                    <p className="text-sm text-white font-medium mt-0.5">{websiteSettings.officeAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Legal Hotline</h4>
                    <p className="text-sm text-white font-medium mt-0.5">{websiteSettings.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Confidential Email</h4>
                    <p className="text-sm text-white font-medium mt-0.5">{websiteSettings.emailAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Counsel Chambers Hours</h4>
                    <p className="text-sm text-white font-medium mt-0.5">{websiteSettings.workingHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inbound Contact Form */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200">
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">Send a Confidential Inquiry</h3>
              <p className="text-xs text-slate-500 mb-6">
                Direct transmission to administrator docket. We respond within 24 hours.
              </p>

              {contactSent ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center animate-fadeIn">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-serif font-bold text-emerald-900 text-lg">Inquiry Dispatched to Admin</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your message has been assigned to our intake queue and recorded in our internal administrator inbox.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Johnathan Davis"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="jdavis@company.com"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+1 (555) 012-3456"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="e.g. Corporate M&A Investigation"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Summary of Legal Inquiry
                    </label>
                    <textarea
                      rows={4}
                      value={contactMessageText}
                      onChange={(e) => setContactMessageText(e.target.value)}
                      placeholder="Outline the matter, court deadlines, or preliminary assistance required..."
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Transmit Message to Partner Desk</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 text-white font-serif font-bold text-lg mb-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <span>Sterling Vance &amp; Thorne</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                National Law Case Management &amp; Sovereign Trial Advocacy. Protecting enterprise capital and individual
                liberties.
              </p>
            </div>

            <div>
              <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Navigation</h5>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="hover:text-amber-400 transition">
                    About the Firm
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-amber-400 transition">
                    Practice Areas
                  </a>
                </li>
                <li>
                  <a href="#attorneys" className="hover:text-amber-400 transition">
                    Lead Attorneys
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-amber-400 transition">
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Client Portals</h5>
              <ul className="space-y-2">
                <li>
                  <button onClick={onOpenApply} className="hover:text-amber-400 transition text-left">
                    Submit Case Application
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenAuth('login')} className="hover:text-amber-400 transition text-left">
                    Client &amp; Attorney Sign In
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenAuth('register')} className="hover:text-amber-400 transition text-left">
                    Register Client Account
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Legal Disclaimer</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                The information provided on this site does not constitute formal legal advice. Viewing this information
                or submitting an intake request does not establish an attorney-client relationship until an engagement
                retainer is executed.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Sterling Vance &amp; Thorne, LLP. All rights reserved.</p>
            <p>LCMS Case Management Architecture • Version 5.2 Enterprise</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
