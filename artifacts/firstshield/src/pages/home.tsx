import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Smartphone, Gauge, FileText, Eye, User, Moon, Wifi, ShieldAlert,
  CheckCircle2, AlertTriangle, ArrowRight, Play, Pause, RotateCcw,
  Volume2, VolumeX, Headphones, Zap, Lock, Star, Heart
} from "lucide-react";
import {
  SiWhatsapp, SiSignal, SiGooglechrome, SiBrave, SiDuckduckgo, SiGoogle,
  SiGmail, SiProtonmail, SiGooglemaps, SiTiktok, SiYoutube, SiApple, SiAndroid,
  SiFacebook, SiSnapchat, SiNetflix, SiSpotify, SiZoom, SiTelegram
} from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── Sound Engine ─────────────────────────────────────────────────────────────
let _ctx: AudioContext | null = null;
function ctx() {
  if (!_ctx) {
    try { _ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  return _ctx;
}
function tone(freq: number, type: OscillatorType, dur: number, vol = 0.15, delay = 0) {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + delay);
  g.gain.setValueAtTime(0, c.currentTime + delay);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
  o.start(c.currentTime + delay); o.stop(c.currentTime + delay + dur + 0.05);
}
const sfx = {
  chime:    () => { tone(880,"sine",0.5); tone(1108,"sine",0.5,0.1,0.12); tone(1320,"sine",0.6,0.12,0.25); },
  click:    () => { tone(600,"sine",0.1,0.1); tone(800,"sine",0.08,0.07,0.05); },
  flip:     () => { tone(440,"sine",0.15,0.12); tone(660,"sine",0.15,0.1,0.08); },
  success:  () => { [523,659,784,1047].forEach((f,i)=>tone(f,"sine",0.4,0.13,i*0.1)); },
  restBell: () => { [880,1108,1320].forEach((f,i)=>tone(f,"sine",0.5,0.15,i*0.14)); },
  workBell: () => { [660,880].forEach((f,i)=>tone(f,"sine",0.35,0.12,i*0.12)); },
};

// ── Floating Particle (hero background) ──────────────────────────────────────
function Particle({ x, y, size, delay, color }: any) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{ y: [0, -30, 0], opacity: [0.4, 0.9, 0.4], scale: [1, 1.2, 1] }}
      transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

const PARTICLES = [
  { x: 10, y: 20, size: 8, delay: 0,   color: "#F3E8FF" },
  { x: 85, y: 15, size: 12, delay: 0.5, color: "#FFE5EC" },
  { x: 20, y: 75, size: 6,  delay: 1,   color: "#EAF7ED" },
  { x: 75, y: 70, size: 10, delay: 1.5, color: "#E8F0FE" },
  { x: 50, y: 10, size: 7,  delay: 2,   color: "#FFF2CC" },
  { x: 5,  y: 50, size: 9,  delay: 0.8, color: "#F3E8FF" },
  { x: 92, y: 45, size: 6,  delay: 2.3, color: "#FFE5EC" },
  { x: 40, y: 85, size: 11, delay: 1.2, color: "#EAF7ED" },
];

// ── Ghibli Popup ─────────────────────────────────────────────────────────────
function GhibliModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => { if (open) sfx.chime(); }, [open]);

  const sparkles = [
    { x: "12%", y: "18%", s: 1.1, d: 0 },
    { x: "82%", y: "14%", s: 0.9, d: 0.3 },
    { x: "8%",  y: "72%", s: 1.2, d: 0.6 },
    { x: "88%", y: "68%", s: 0.8, d: 0.9 },
    { x: "50%", y: "8%",  s: 1.0, d: 0.4 },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: "rgba(30,20,50,0.55)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-sm w-full rounded-[2.5rem] overflow-hidden shadow-2xl"
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            onClick={e => e.stopPropagation()}
            style={{ background: "linear-gradient(160deg,#fffbe8 0%,#e8f7ed 50%,#f3e8ff 100%)" }}
          >
            {/* Stars */}
            {sparkles.map((sp, i) => (
              <motion.div key={i} className="absolute text-yellow-300 text-lg select-none pointer-events-none"
                style={{ left: sp.x, top: sp.y }}
                animate={{ rotate: [0,20,-20,0], scale: [sp.s, sp.s*1.4, sp.s], opacity: [0.7,1,0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: sp.d }}
              >★</motion.div>
            ))}

            {/* Ghibli SVG Scene */}
            <div className="flex justify-center pt-8 pb-2 relative">
              <svg width="200" height="170" viewBox="0 0 200 170" fill="none">
                {/* Moon */}
                <motion.ellipse cx="155" cy="30" rx="22" ry="22" fill="#FFF9C4"
                  animate={{ opacity: [0.8,1,0.8] }} transition={{ duration: 3, repeat: Infinity }} />
                <ellipse cx="162" cy="24" rx="13" ry="13" fill="#fffbe8" />

                {/* Stars around moon */}
                <motion.text x="130" y="18" fontSize="10" fill="#FDD835"
                  animate={{ opacity: [0.5,1,0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>✦</motion.text>
                <motion.text x="180" y="42" fontSize="8" fill="#FDD835"
                  animate={{ opacity: [0.4,0.9,0.4] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.7 }}>✦</motion.text>

                {/* Ground */}
                <ellipse cx="100" cy="158" rx="70" ry="14" fill="#C8E6C9" />

                {/* Tree */}
                <rect x="28" y="85" width="8" height="55" rx="4" fill="#8D6E63" />
                <ellipse cx="32" cy="78" rx="24" ry="28" fill="#66BB6A" />
                <ellipse cx="20" cy="90" rx="14" ry="18" fill="#81C784" />
                <ellipse cx="44" cy="88" rx="14" ry="18" fill="#4CAF50" />

                {/* Creature body (Totoro-like round spirit) */}
                <motion.g animate={{ y: [0,-4,0] }} transition={{ duration: 3, repeat: Infinity, ease:"easeInOut" }}>
                  {/* Body */}
                  <ellipse cx="105" cy="118" rx="38" ry="42" fill="#78909C" />
                  {/* Belly */}
                  <ellipse cx="105" cy="124" rx="26" ry="30" fill="#ECEFF1" />
                  {/* Belly pattern dots */}
                  <circle cx="98" cy="118" r="3.5" fill="#B0BEC5" />
                  <circle cx="112" cy="115" r="2.5" fill="#B0BEC5" />
                  <circle cx="103" cy="128" r="3" fill="#B0BEC5" />

                  {/* Ears */}
                  <ellipse cx="78" cy="82" rx="10" ry="15" fill="#78909C" />
                  <ellipse cx="132" cy="82" rx="10" ry="15" fill="#78909C" />
                  <ellipse cx="78" cy="81" rx="5" ry="9" fill="#90A4AE" />
                  <ellipse cx="132" cy="81" rx="5" ry="9" fill="#90A4AE" />

                  {/* Eyes */}
                  <circle cx="93" cy="100" r="8" fill="white" />
                  <circle cx="117" cy="100" r="8" fill="white" />
                  <circle cx="95" cy="101" r="4.5" fill="#37474F" />
                  <circle cx="119" cy="101" r="4.5" fill="#37474F" />
                  <circle cx="96" cy="99" r="1.5" fill="white" />
                  <circle cx="120" cy="99" r="1.5" fill="white" />

                  {/* Nose */}
                  <ellipse cx="105" cy="110" rx="4" ry="2.5" fill="#546E7A" />

                  {/* Whiskers */}
                  <line x1="65" y1="107" x2="88" y2="110" stroke="#90A4AE" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="65" y1="112" x2="88" y2="113" stroke="#90A4AE" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="122" y1="110" x2="145" y2="107" stroke="#90A4AE" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="122" y1="113" x2="145" y2="112" stroke="#90A4AE" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Wired earphones! */}
                  {/* Left earbud on ear */}
                  <circle cx="68" cy="85" r="7" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="1.5" />
                  <circle cx="68" cy="85" r="3" fill="#BDBDBD" />
                  {/* Wire going down and across */}
                  <path d="M68 92 Q68 130 100 138 Q132 130 132 92" stroke="#616161" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  {/* Right earbud */}
                  <circle cx="132" cy="85" r="7" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="1.5" />
                  <circle cx="132" cy="85" r="3" fill="#BDBDBD" />
                  {/* Jack plug at bottom */}
                  <rect x="96" y="135" width="8" height="14" rx="4" fill="#424242" />

                  {/* Smile */}
                  <path d="M96 118 Q105 126 114 118" stroke="#546E7A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </motion.g>

                {/* Floating music notes */}
                <motion.text x="155" y="80" fontSize="16" fill="#CE93D8"
                  animate={{ y: [0,-18,0], opacity: [0,1,0], rotate: [0,15,0] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 0.2 }}>♪</motion.text>
                <motion.text x="168" y="100" fontSize="12" fill="#80CBC4"
                  animate={{ y: [0,-14,0], opacity: [0,0.9,0], rotate: [0,-10,0] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: 0.9 }}>♫</motion.text>
                <motion.text x="20" y="65" fontSize="13" fill="#A5D6A7"
                  animate={{ y: [0,-12,0], opacity: [0,0.8,0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.4 }}>♪</motion.text>
              </svg>
            </div>

            {/* Text content */}
            <div className="px-7 pb-7 text-center">
              <h2 className="text-2xl font-heading font-bold text-[#37474F] mb-1">Wired is Wiser! 🌿</h2>
              <p className="text-sm text-[#546E7A] leading-relaxed mb-4">
                Bluetooth headphones can expose you to unnecessary RF signals and hacking risks.
              </p>

              {/* Reason pills */}
              <div className="space-y-2 mb-6 text-left">
                {[
                  { icon: "⚡", color: "bg-[#FFF9C4] text-[#F57F17]", text: "Zero radiation — wired emits no RF signals" },
                  { icon: "🔒", color: "bg-[#E8F5E9] text-[#2E7D32]", text: "No pairing — hackers can't intercept your audio" },
                  { icon: "🎵", color: "bg-[#EDE7F6] text-[#512DA8]", text: "Better sound quality at every volume level" },
                  { icon: "🔋", color: "bg-[#E3F2FD] text-[#1565C0]", text: "No battery drain — plug in and play instantly" },
                ].map((r, i) => (
                  <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold ${r.color}`}>
                    <span className="text-base">{r.icon}</span> {r.text}
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
                onClick={() => { sfx.success(); onClose(); }}
                className="w-full py-3.5 rounded-2xl font-heading font-bold text-white text-base shadow-lg"
                style={{ background: "linear-gradient(135deg,#66BB6A,#42A5F5)" }}
              >
                Got it, I'll use wired! ✓
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Base Card ─────────────────────────────────────────────────────────────────
function BaseCard({ children, icon: Icon, iconBg, iconColor, title, accent = "#7D52B3", className = "" }: any) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white rounded-3xl p-6 border border-[#EDE7DE] shadow-sm relative overflow-hidden ${className}`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: `linear-gradient(90deg,${accent},${accent}44)` }} />
      <div className="flex items-center gap-4 mb-5 mt-1">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
        <h2 className="text-xl font-heading font-bold">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// ── Card 1: App Safety ────────────────────────────────────────────────────────
type AppKey = "social"|"google"|"messaging"|"shopping"|"finance"|"streaming"|"work"|"dating";

const APP_CATEGORIES: Record<AppKey,{ emoji:string; label:string; green:string[]; red:string[] }> = {
  social: {
    emoji:"📱", label:"Social",
    green:["Can set account to private", "Option to limit data sharing", "Downloadable copy of your data"],
    red:  ["Facebook/Instagram sell your data to advertisers", "TikTok sends data to servers overseas", "Snapchat stores snaps longer than claimed"],
  },
  google: {
    emoji:"🔍", label:"Google",
    green:["Auto-delete activity history option", "Two-step verification available", "Incognito mode on YouTube & Chrome"],
    red:  ["Tracks location even when app is closed", "Voice recordings stored in Google servers", "All searches profiled for targeted ads"],
  },
  messaging: {
    emoji:"💬", label:"Messaging",
    green:["WhatsApp & Telegram have end-to-end encryption", "Signal is fully open-source & private", "Can disable read receipts on most apps"],
    red:  ["WhatsApp shares metadata with Facebook", "Regular SMS has no encryption at all", "Telegram cloud chats are NOT end-to-end encrypted"],
  },
  shopping: {
    emoji:"🛍", label:"Shopping",
    green:["Amazon offers purchase history controls", "Can use guest checkout to avoid profiling", "Price comparison keeps sellers honest"],
    red:  ["Shopping apps track every product you browse", "Wish & Meesho collect extensive device data", "Discount apps often sell your data to third parties"],
  },
  finance: {
    emoji:"💳", label:"Finance",
    green:["UPI apps (GPay, PhonePe) are RBI-regulated", "Net banking uses OTP two-factor auth", "Official bank apps have fraud insurance"],
    red:  ["Loan apps request contacts & photos illegally", "Crypto apps are unregulated — no recourse", "BNPL apps charge hidden interest after free period"],
  },
  streaming: {
    emoji:"🎬", label:"Streaming",
    green:["Netflix/Spotify have clear data policies", "Can control personalization in settings", "Offline downloads protect your privacy on public Wi-Fi"],
    red:  ["Netflix monitors what you pause and rewind", "Spotify tracks mood through music habits", "Free streaming sites often inject malware"],
  },
  work: {
    emoji:"💼", label:"Work",
    green:["Zoom and Teams offer end-to-end encryption", "LinkedIn lets you download your data", "Can limit calendar access on mobile"],
    red:  ["Zoom has had repeated privacy controversies", "LinkedIn shares data with advertising partners", "Work apps on personal phones can access device files"],
  },
  dating: {
    emoji:"💕", label:"Dating",
    green:["Can use a separate email to sign up", "Photo blur feature on some apps", "Block/report features widely available"],
    red:  ["Tinder sold location data to third parties", "Dating apps store your photos & messages indefinitely", "Profile data can be scraped by bots for scams"],
  },
};

function AppSafetyCard() {
  const [tab, setTab] = useState<AppKey>("social");
  const keys = Object.keys(APP_CATEGORIES) as AppKey[];
  const d = APP_CATEGORIES[tab];
  return (
    <BaseCard icon={Smartphone} iconBg="bg-[#F3E8FF]" iconColor="#7D52B3" title="All-App Safety Advisor" accent="#7D52B3">
      {/* Scrollable tab strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {keys.map(t => (
          <button key={t} onClick={() => { setTab(t); sfx.click(); }}
            className={`shrink-0 text-xs py-1.5 px-3 rounded-full font-bold transition-all duration-200 whitespace-nowrap
              ${tab===t ? "bg-[#7D52B3] text-white shadow" : "bg-[#F3E8FF] text-[#7D52B3] hover:bg-[#E9D5FF]"}`}>
            {APP_CATEGORIES[t].emoji} {APP_CATEGORIES[t].label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}
          transition={{ duration: 0.2 }} className="space-y-3">
          <div className="bg-[#EAF7ED] rounded-2xl p-4">
            <p className="text-xs font-bold text-[#3A7D54] flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> Green Flags
            </p>
            {d.green.map((g,i) => (
              <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}
                className="flex items-start gap-2 text-sm text-[#2E5A44] py-1">
                <span className="text-[#62B685] mt-0.5 shrink-0">✓</span> {g}
              </motion.div>
            ))}
          </div>
          <div className="bg-[#FFE5EC] rounded-2xl p-4">
            <p className="text-xs font-bold text-[#C94A4A] flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5" /> Red Flags
            </p>
            {d.red.map((r,i) => (
              <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}
                className="flex items-start gap-2 text-sm text-[#8B2020] py-1">
                <span className="text-[#E57373] mt-0.5 shrink-0">⚠</span> {r}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </BaseCard>
  );
}

// ── Card 2: Privacy Score ─────────────────────────────────────────────────────
const PERM_ITEMS = [
  { id:"loc",      label:"📍 Location",  desc:"Tracks where you are at all times",         pts:25 },
  { id:"contacts", label:"👥 Contacts",  desc:"Can leak your friends' phone numbers",       pts:25 },
  { id:"sms",      label:"💬 SMS",       desc:"Reads your OTPs and personal messages",      pts:25 },
  { id:"cam",      label:"📷 Camera",    desc:"May capture photos/video without you knowing",pts:25 },
];

function ScoreRing({ score }: { score: number }) {
  const r = 44, circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color = score === 100 ? "#62B685" : score >= 75 ? "#D4A373" : score >= 50 ? "#E57373" : "#C94A4A";
  return (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#EDE7DE" strokeWidth="10" />
      <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transformOrigin:"50px 50px", rotate:"-90deg" }}
        animate={{ strokeDashoffset: offset }} transition={{ duration: 0.6, ease:"easeOut" }} />
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>{score}</text>
      <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#6C6775">/ 100</text>
    </svg>
  );
}

function PrivacyScoreCard() {
  const [perms, setPerms] = useState({ loc:false, contacts:false, sms:false, cam:false });
  const score = 100 - PERM_ITEMS.reduce((a,p) => a + (perms[p.id as keyof typeof perms] ? p.pts : 0), 0);
  const prev = useRef(100);
  useEffect(() => {
    if (score === 100 && prev.current < 100) sfx.success();
    prev.current = score;
  }, [score]);

  const label = score===100 ? "🛡 Safe!" : score===75 ? "⚠ Caution" : score===50 ? "🚨 Risk!" : "💀 Danger!";
  const labelColor = score===100 ? "text-[#3A7D54]" : score===75 ? "text-[#957A1E]" : "text-[#C94A4A]";

  return (
    <BaseCard icon={Gauge} iconBg="bg-[#FFE5EC]" iconColor="#E57373" title="Privacy Score" accent="#E57373">
      <p className="text-xs text-[#6C6775] mb-4 font-medium">Which permissions is the app requesting?</p>
      <div className="space-y-2 mb-5">
        {PERM_ITEMS.map(item => (
          <label key={item.id} onClick={() => sfx.click()}
            className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all duration-200
              ${perms[item.id as keyof typeof perms] ? "border-[#E57373] bg-[#FFF5F5]" : "border-[#EDE7DE] hover:bg-[#FCF9F5]"}`}>
            <input type="checkbox" checked={perms[item.id as keyof typeof perms]}
              onChange={e => setPerms({...perms, [item.id]: e.target.checked})}
              className="mt-0.5 h-4 w-4 accent-[#E57373] cursor-pointer" />
            <div>
              <div className="text-sm font-bold">{item.label}</div>
              <div className="text-xs text-[#6C6775]">{item.desc}</div>
            </div>
            <span className="ml-auto text-xs font-bold text-[#E57373] mt-0.5">−{item.pts}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-[#FCF9F5] border border-[#EDE7DE]">
        <ScoreRing score={score} />
        <div>
          <motion.p key={label} initial={{ scale:0.7,opacity:0 }} animate={{ scale:1,opacity:1 }}
            className={`text-2xl font-heading font-bold ${labelColor}`}>{label}</motion.p>
          <p className="text-xs text-[#6C6775] mt-1 max-w-[120px] leading-snug">
            {score===100?"No risks detected":score===75?"Low risk — be careful":score===50?"Multiple risks — review permissions":"Very high risk — avoid this app!"}
          </p>
        </div>
      </div>
    </BaseCard>
  );
}

// ── Card 3: Terms Cheat Sheet ─────────────────────────────────────────────────
const TRAPS = [
  { emoji:"🔍", title:"Google: Data Collection", desc:"Your watched videos, searches, and voice recordings are permanently stored to build your ad profile.", severity:"high" },
  { emoji:"📸", title:"Instagram: Image Ownership", desc:"Instagram gets a royalty-free licence to use any photo you post for their own commercial purposes.", severity:"high" },
  { emoji:"📜", title:"Hidden Clauses", desc:"Most free apps can silently change their terms at any time — without ever notifying you.", severity:"medium" },
  { emoji:"🎁", title:"Free = You're the Product", desc:"When an app costs nothing, your data — browsing, location, contacts — is what gets sold to advertisers.", severity:"high" },
];

function TermsCard() {
  const [open, setOpen] = useState<number|null>(null);
  return (
    <BaseCard icon={FileText} iconBg="bg-[#FFF2CC]" iconColor="#D4A373" title="Don't Sign Without Reading!" accent="#D4A373">
      <p className="text-xs text-[#6C6775] mb-4">Tap each trap to learn more ↓</p>
      <div className="space-y-2">
        {TRAPS.map((t,i) => (
          <motion.div key={i} layout onClick={() => { setOpen(open===i?null:i); sfx.click(); }}
            className={`rounded-2xl cursor-pointer border-l-4 overflow-hidden transition-colors duration-200
              ${t.severity==="high" ? "border-[#E57373] bg-[#FFF5F5] hover:bg-[#FFE5EC]" : "border-[#D4A373] bg-[#FFFAF0] hover:bg-[#FFF2CC]"}`}>
            <div className="flex items-center gap-3 p-3.5">
              <span className="text-xl">{t.emoji}</span>
              <span className="text-sm font-bold flex-1">{t.title}</span>
              <motion.span animate={{ rotate: open===i ? 90 : 0 }} className="text-[#6C6775] text-lg font-light">›</motion.span>
            </div>
            <AnimatePresence>
              {open===i && (
                <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }}
                  exit={{ height:0,opacity:0 }} transition={{ duration:0.25 }}>
                  <p className="px-4 pb-4 text-xs leading-relaxed text-[#3D3A45] opacity-90">{t.desc}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </BaseCard>
  );
}

// ── Card 4: Eye Health ────────────────────────────────────────────────────────
function EyeHealthCard() {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(20*60);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"work"|"rest">("work");

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (phase==="work") {
            setPhase("rest");
            sfx.restBell();
            toast({ title:"👁 Rest your eyes!", description:"Look 20 feet away for 20 seconds.", duration:4000 });
            return 20;
          } else {
            setPhase("work");
            sfx.workBell();
            return 20*60;
          }
        }
        return t-1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, phase, toast]);

  const total = phase==="work" ? 20*60 : 20;
  const pct = ((total-timeLeft)/total)*100;
  const r = 46, circ = 2*Math.PI*r;
  const strokeColor = phase==="work" ? "#4A90E2" : "#62B685";
  const fmt = (s:number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <BaseCard icon={Eye} iconBg="bg-[#EAF7ED]" iconColor="#4F9D69" title="Eye Health Guard (20-20-20)" accent="#4F9D69">
      <div className="bg-[#FFF9E6] border border-[#F0E4BE] rounded-2xl p-3.5 text-sm mb-5 leading-relaxed">
        <span className="font-bold">Every 20 mins</span> → Look <span className="font-bold">20 ft</span> away for <span className="font-bold">20 secs</span>. Prevents digital eye strain.
      </div>

      {/* Ring */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative w-44 h-44 mb-4">
          {phase==="rest" && (
            <motion.div className="absolute inset-0 rounded-full border-4 border-[#62B685]"
              animate={{ scale:[1,1.08,1], opacity:[0.4,0.8,0.4] }} transition={{ duration:1.2, repeat:Infinity }} />
          )}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#EDE7DE" strokeWidth="8" />
            <motion.circle cx="50" cy="50" r={r} fill="none" stroke={strokeColor} strokeWidth="8"
              strokeDasharray={circ} strokeDashoffset={circ-(circ*pct)/100} strokeLinecap="round"
              animate={{ strokeDashoffset: circ-(circ*pct)/100 }} transition={{ duration:0.8 }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold tracking-widest mb-0.5" style={{ color: strokeColor }}>
              {phase==="work" ? "FOCUS" : "REST ✨"}
            </span>
            <span className="text-3xl font-heading font-bold text-[#3D3A45]">{fmt(timeLeft)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale:0.92 }} onClick={() => { setIsActive(!isActive); sfx.click(); }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-bold shadow"
            style={{ background: isActive ? "#E57373" : "linear-gradient(135deg,#4A90E2,#7D52B3)" }}>
            {isActive ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />Start</>}
          </motion.button>
          <motion.button whileTap={{ scale:0.92 }} onClick={() => { setIsActive(false);setPhase("work");setTimeLeft(20*60); sfx.click(); }}
            className="px-4 py-2.5 rounded-full border border-[#EDE7DE] text-[#6C6775] hover:bg-[#FCF9F5] transition-colors">
            <RotateCcw className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Symptom grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { emoji:"👁", label:"Blurry vision", fix:"Blink more — 15× per minute", color:"bg-[#E8F0FE]" },
          { emoji:"😴", label:"Eye fatigue", fix:"Use lubricating eye drops", color:"bg-[#EAF7ED]" },
          { emoji:"🤕", label:"Headache", fix:"Lower screen brightness now", color:"bg-[#FFE5EC]" },
          { emoji:"💧", label:"Dry eyes", fix:"Use the 20-20-20 rule daily", color:"bg-[#FFF2CC]" },
        ].map((s,i) => (
          <motion.div key={i} whileHover={{ scale:1.04 }} className={`${s.color} p-3 rounded-2xl cursor-default`}>
            <div className="text-lg mb-0.5">{s.emoji}</div>
            <div className="text-xs font-bold text-[#3D3A45]">{s.label}</div>
            <div className="text-[10px] text-[#6C6775] mt-0.5 leading-snug">{s.fix}</div>
          </motion.div>
        ))}
      </div>
    </BaseCard>
  );
}

// ── Card 5: Posture ───────────────────────────────────────────────────────────
const postureData = [
  { name:"0°",  weight:12, fill:"#62B685", label:"✅ Ideal" },
  { name:"15°", weight:27, fill:"#A8C66C", label:"Slight" },
  { name:"30°", weight:40, fill:"#D4A373", label:"Caution" },
  { name:"45°", weight:49, fill:"#E58F73", label:"High risk" },
  { name:"60°", weight:60, fill:"#E57373", label:"🚨 Danger" },
];

function PostureCard() {
  return (
    <BaseCard icon={User} iconBg="bg-[#E8F0FE]" iconColor="#4A90E2" title="Protect Your Neck" accent="#4A90E2">
      <p className="text-xs text-[#6C6775] mb-3 font-medium">Phone tilt → effective weight on your neck</p>
      <div className="h-[190px] w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={postureData} layout="vertical" margin={{ top:0, right:40, left:10, bottom:0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize:12, fontWeight:"700" }} width={30} />
            <Tooltip cursor={{ fill:"rgba(0,0,0,0.04)" }} content={({ payload }) =>
              payload?.length ? <div className="bg-[#3D3A45] text-white text-xs px-2.5 py-1.5 rounded-xl shadow">{payload[0].value} lbs</div> : null
            } />
            <Bar dataKey="weight" radius={[0,6,6,0]} barSize={22} label={{ position:"right", fontSize:10, fontWeight:"700" }}>
              {postureData.map((e,i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {[
          { icon:"📱", bg:"bg-[#E8F0FE]", tip:"Hold phone at eye level, not in your lap" },
          { icon:"🪑", bg:"bg-[#EAF7ED]", tip:"Sit with your back straight and shoulders relaxed" },
          { icon:"⏱",  bg:"bg-[#FFF2CC]", tip:"Take posture breaks every 30 minutes" },
          { icon:"💪", bg:"bg-[#FFE5EC]", tip:"Neck stretches: tilt head side to side, 5 reps" },
        ].map((t,i) => (
          <motion.div key={i} whileHover={{ x:4 }}
            className={`flex items-center gap-3 p-3 rounded-2xl ${t.bg} text-sm font-medium text-[#3D3A45]`}>
            <span className="text-base">{t.icon}</span> {t.tip}
          </motion.div>
        ))}
      </div>
    </BaseCard>
  );
}

// ── Card 6: Sleep ─────────────────────────────────────────────────────────────
function SleepCard() {
  return (
    <BaseCard icon={Moon} iconBg="bg-[#F3E8FF]" iconColor="#7D52B3" title="Protect Your Sleep" accent="#7D52B3">
      {/* Animated melatonin flow */}
      <div className="flex items-center justify-between mb-6">
        {[
          { label:"Blue Light", bg:"bg-[#E8F0FE]", color:"text-[#4A90E2]", icon:"💡" },
          { label:"Suppresses Melatonin", bg:"bg-[#FFE5EC]", color:"text-[#E57373]", icon:"😶" },
          { label:"Delays Sleep", bg:"bg-[#F3E8FF]", color:"text-[#7D52B3]", icon:"😴" },
        ].map((b,i) => (
          <React.Fragment key={i}>
            <motion.div className={`${b.bg} rounded-2xl p-3 text-center flex-1`}
              animate={{ scale:[1,1.04,1] }} transition={{ duration:2.5, repeat:Infinity, delay:i*0.5 }}>
              <div className="text-lg">{b.icon}</div>
              <div className={`text-[10px] font-bold leading-snug mt-1 ${b.color}`}>{b.label}</div>
            </motion.div>
            {i<2 && (
              <motion.div animate={{ x:[0,4,0] }} transition={{ duration:1.2, repeat:Infinity }}
                className="text-[#E58F73] mx-1 text-xl">→</motion.div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-3 mb-4">
        {[
          { os:"iOS", icon:<SiApple className="h-4 w-4 text-gray-700" />, bg:"bg-[#F5F5F7]",
            steps:["Settings → Display & Brightness → Night Shift","Schedule: Sunset to Sunrise","Color warmth: drag to More Warm"] },
          { os:"Android", icon:<SiAndroid className="h-4 w-4 text-[#3DDC84]" />, bg:"bg-[#E8F5E9]",
            steps:["Settings → Display → Eye Comfort Shield","Toggle ON, set schedule","Adjust color temperature to warm"] },
        ].map((os,i) => (
          <div key={i} className={`${os.bg} rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm">
              {os.icon} {os.os} Bedtime Setup
            </div>
            <ol className="space-y-1">
              {os.steps.map((s,j) => (
                <li key={j} className="flex gap-2 text-xs text-[#3D3A45] opacity-90">
                  <span className="font-bold text-[#7D52B3] shrink-0">{j+1}.</span>{s}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="bg-[#EAF7ED] rounded-2xl p-3.5 text-sm text-[#2E5A44] flex gap-2 items-start">
        <span className="text-base shrink-0">💡</span>
        <p><span className="font-bold">Stop phone use 1 hour before bed.</span> Even Night Shift can't stop the mental stimulation that delays sleep.</p>
      </div>
    </BaseCard>
  );
}

// ── Card 7: Wi-Fi Safety ──────────────────────────────────────────────────────
const MYTHS = [
  { myth:"Wi-Fi causes cancer",           fact:"Non-ionizing radiation cannot damage DNA — proven safe by WHO" },
  { myth:"Router must be far from bed",   fact:"Signal drops with distance but remains safe at any room distance" },
  { myth:"5G is dangerous",               fact:"5G uses radio waves — same physics as 4G, rigorously tested" },
  { myth:"Airplane mode cures radiation", fact:"Airplane mode just disables radios — only needed on actual flights" },
];

const TIPS = [
  { icon:"🔐", tip:"Use a VPN on public Wi-Fi (cafés, trains)", color:"bg-[#E8F0FE] text-[#1565C0]" },
  { icon:"🏦", tip:"Never do banking on open/unsecured networks", color:"bg-[#FFE5EC] text-[#C62828]" },
  { icon:"📵", tip:"Keep Bluetooth OFF when not actively using it", color:"bg-[#EAF7ED] text-[#2E7D32]" },
  { icon:"🎧", tip:"Headphone volume max 60% — 60 min limit (60/60 rule)", color:"bg-[#FFF2CC] text-[#E65100]" },
  { icon:"🛌", tip:"Never sleep with phone under your pillow", color:"bg-[#F3E8FF] text-[#512DA8]" },
  { icon:"🔑", tip:"Confirm network is password-protected before connecting", color:"bg-[#E8F5E9] text-[#1B5E20]" },
];

function FlipCard({ myth, fact }: { myth:string; fact:string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="relative h-[90px] cursor-pointer" style={{ perspective:600 }}
      onClick={() => { setFlipped(!flipped); sfx.flip(); }}>
      <motion.div className="absolute inset-0 w-full h-full" style={{ transformStyle:"preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration:0.45, ease:"easeInOut" }}>
        {/* Front - Myth */}
        <div className="absolute inset-0 rounded-2xl bg-[#FFF5F5] border border-[#FECACA] p-3 flex flex-col justify-between"
          style={{ backfaceVisibility:"hidden" }}>
          <span className="text-[10px] font-bold text-[#C94A4A] uppercase tracking-wider">🔴 Myth</span>
          <p className="text-xs font-semibold text-[#3D3A45] leading-snug">{myth}</p>
          <span className="text-[9px] text-[#6C6775]">Tap to reveal fact →</span>
        </div>
        {/* Back - Fact */}
        <div className="absolute inset-0 rounded-2xl bg-[#EAF7ED] border border-[#A7D7B8] p-3 flex flex-col justify-between"
          style={{ backfaceVisibility:"hidden", transform:"rotateY(180deg)" }}>
          <span className="text-[10px] font-bold text-[#3A7D54] uppercase tracking-wider">🟢 Fact</span>
          <p className="text-xs font-semibold text-[#2E5A44] leading-snug">{fact}</p>
          <span className="text-[9px] text-[#6C6775]">← Tap to flip back</span>
        </div>
      </motion.div>
    </div>
  );
}

function WifiSafetyCard() {
  return (
    <BaseCard icon={Wifi} iconBg="bg-[#EAF7ED]" iconColor="#4F9D69" title="Wi-Fi Safety: Myths vs Facts" accent="#4F9D69">
      <div className="bg-[#EAF7ED] border border-[#A7D7B8] rounded-2xl p-3.5 mb-5 flex items-center gap-3 text-sm text-[#2E5A44]">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#62B685]" />
        <p><strong>Wi-Fi radiation is safe (non-ionizing).</strong> WHO-classified harmless. No proven health risk.</p>
      </div>

      <p className="text-xs font-bold text-[#6C6775] mb-3">Tap each card to reveal the fact 👇</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {MYTHS.map((m,i) => <FlipCard key={i} myth={m.myth} fact={m.fact} />)}
      </div>

      <p className="text-xs font-bold text-[#3D3A45] mb-3 flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-[#D4A373]" /> Practical Safety Tips
      </p>
      <div className="space-y-2">
        {TIPS.map((t,i) => (
          <motion.div key={i} whileHover={{ x:5 }}
            className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold ${t.color}`}>
            <span className="text-base shrink-0">{t.icon}</span> {t.tip}
          </motion.div>
        ))}
      </div>
    </BaseCard>
  );
}

// ── Card 9: No Phone After 10 PM ─────────────────────────────────────────────
const NIGHT_HARMS = [
  { icon:"🧠", title:"Brain stays alert",    desc:"Blue light tricks your brain into thinking it's daytime, suppressing the sleep hormone melatonin for up to 3 hours.", color:"bg-[#E8F0FE] border-[#C5D8FB] text-[#1565C0]" },
  { icon:"❤️", title:"Heart health risk",    desc:"Chronic sleep deprivation from late-night phone use is linked to higher blood pressure and increased heart disease risk.", color:"bg-[#FFE5EC] border-[#FECACA] text-[#C62828]" },
  { icon:"😵", title:"Memory & focus drop",  desc:"Your brain consolidates memories during deep sleep. Disrupting it harms concentration, learning, and decision-making the next day.", color:"bg-[#F3E8FF] border-[#DDD6FE] text-[#5B21B6]" },
  { icon:"😤", title:"Mood & anxiety up",    desc:"Just 1 hour of phone use after 10 PM measurably increases next-day irritability, anxiety, and emotional reactivity.", color:"bg-[#FFF2CC] border-[#FDE68A] text-[#92400E]" },
  { icon:"👁", title:"Eye strain peaks",     desc:"Screen glare in a dark room forces your eyes to work hardest, causing dry eyes, headaches, and accelerated myopia (short-sightedness).", color:"bg-[#EAF7ED] border-[#A7D7B8] text-[#1B5E20]" },
  { icon:"🍔", title:"Weight gain risk",     desc:"Sleep loss triggers hunger hormones (ghrelin). Late-night scrolling leads to midnight snacking and disrupted metabolism.", color:"bg-[#FFF0E8] border-[#FDBA74] text-[#92400E]" },
];

const BEDTIME_HABITS = [
  { time:"9:30 PM", action:"Put phone on Do Not Disturb", icon:"🔕" },
  { time:"9:45 PM", action:"Charge phone outside your bedroom", icon:"🔋" },
  { time:"10:00 PM", action:"Read a book or journal instead", icon:"📖" },
  { time:"10:15 PM", action:"Dim the lights, relax your eyes", icon:"💡" },
  { time:"10:30 PM", action:"Sleep — your body thanks you!", icon:"😴" },
];

function NightTimeCard() {
  const [expanded, setExpanded] = useState<number|null>(null);
  return (
    <BaseCard icon={Moon} iconBg="bg-[#1E1B4B]" iconColor="#A78BFA" title="No Phone After 10 PM" accent="#7C3AED">
      {/* Warning banner */}
      <motion.div
        animate={{ scale:[1,1.015,1] }} transition={{ duration:3, repeat:Infinity }}
        className="relative overflow-hidden rounded-2xl mb-5 p-4 text-center"
        style={{ background:"linear-gradient(135deg,#1E1B4B,#312E81,#4C1D95)" }}>
        {/* Stars in banner */}
        {["10%","30%","55%","75%","90%"].map((l,i)=>(
          <motion.span key={i} className="absolute text-yellow-300 text-xs pointer-events-none"
            style={{ left:l, top:`${15+i*12}%` }}
            animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:2, repeat:Infinity, delay:i*0.4 }}>✦</motion.span>
        ))}
        <div className="text-4xl mb-2">🌙</div>
        <p className="text-white font-heading font-bold text-lg leading-tight">After 10 PM, put it down.</p>
        <p className="text-purple-200 text-xs mt-1.5 leading-relaxed">Your phone is not worth your health. Sleep is the best upgrade you can give your body — for free.</p>
      </motion.div>

      {/* Health harms — tap to expand */}
      <p className="text-xs font-bold text-[#6C6775] mb-3">Tap each to learn why late-night scrolling harms you ↓</p>
      <div className="space-y-2 mb-5">
        {NIGHT_HARMS.map((h,i)=>(
          <motion.div key={i} layout onClick={()=>{setExpanded(expanded===i?null:i); sfx.click();}}
            className={`rounded-2xl border cursor-pointer overflow-hidden ${h.color}`}>
            <div className="flex items-center gap-3 p-3">
              <span className="text-xl shrink-0">{h.icon}</span>
              <span className="text-sm font-bold flex-1">{h.title}</span>
              <motion.span animate={{ rotate: expanded===i?90:0 }} className="opacity-60 text-lg">›</motion.span>
            </div>
            <AnimatePresence>
              {expanded===i && (
                <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }}
                  exit={{ height:0,opacity:0 }} transition={{ duration:0.25 }}>
                  <p className="px-4 pb-4 text-xs leading-relaxed opacity-90">{h.desc}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Bedtime routine timeline */}
      <div className="bg-[#F5F3FF] rounded-2xl p-4 border border-[#DDD6FE]">
        <p className="text-xs font-bold text-[#5B21B6] mb-3 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5" /> Your Ideal Bedtime Routine
        </p>
        <div className="relative pl-4 border-l-2 border-[#C4B5FD] space-y-3">
          {BEDTIME_HABITS.map((h,i)=>(
            <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
              className="flex items-start gap-3">
              <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-[#7C3AED] flex items-center justify-center mt-0.5" style={{ marginLeft:0 }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#7C3AED] block">{h.time}</span>
                <span className="text-xs text-[#3D3A45]">{h.icon} {h.action}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Motivational quote */}
      <div className="mt-4 text-center py-3 px-4 rounded-2xl bg-[#EAF7ED] border border-[#A7D7B8]">
        <p className="text-sm font-bold text-[#2E5A44]">"Early to bed, early to rise — makes you healthy, wealthy and wise."</p>
        <p className="text-xs text-[#6C6775] mt-1">— Benjamin Franklin</p>
      </div>
    </BaseCard>
  );
}

// ── Card 8: Safer Apps ────────────────────────────────────────────────────────
const ALTS = [
  { bad:"WhatsApp", bI:SiWhatsapp, bC:"#25D366", good:"Signal",     gI:SiSignal,    gC:"#3A76F0", why:"End-to-end encrypted, zero ads" },
  { bad:"Chrome",   bI:SiGooglechrome,bC:"#4285F4",good:"Brave",    gI:SiBrave,     gC:"#FF3E00", why:"Blocks all trackers by default" },
  { bad:"Google",   bI:SiGoogle,    bC:"#EA4335", good:"DuckDuckGo",gI:SiDuckduckgo,gC:"#DE5833", why:"No search history ever stored" },
  { bad:"Gmail",    bI:SiGmail,     bC:"#EA4335", good:"ProtonMail", gI:SiProtonmail,gC:"#6D4AFF", why:"End-to-end encrypted email" },
  { bad:"Maps",     bI:SiGooglemaps,bC:"#34A853", good:"OsmAnd",    gI:ShieldAlert,  gC:"#80C342", why:"Open-source, works offline" },
  { bad:"TikTok",   bI:SiTiktok,   bC:"#010101", good:"YouTube",    gI:SiYoutube,   gC:"#FF0000", why:"Better privacy controls" },
];

function SaferAppsCard() {
  const [hover, setHover] = useState<number|null>(null);
  return (
    <BaseCard icon={ShieldAlert} iconBg="bg-[#FFF2CC]" iconColor="#E58F73" title="Safer App Alternatives" accent="#E58F73">
      <p className="text-xs text-[#6C6775] mb-4 font-medium">Privacy-first replacements for popular apps</p>
      <div className="space-y-2">
        {ALTS.map((a,i) => (
          <motion.div key={i} whileHover={{ scale:1.02 }} onHoverStart={() => setHover(i)} onHoverEnd={() => setHover(null)}
            className="relative flex items-center gap-3 p-3.5 rounded-2xl border overflow-hidden cursor-default transition-colors duration-200"
            style={{ borderColor: hover===i ? a.gC+"55" : "#EDE7DE", background: hover===i ? a.gC+"0D" : "#FCF9F5" }}>
            {/* left color bar */}
            <motion.div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{ background: a.gC }} initial={{ scaleY:0 }} animate={{ scaleY: hover===i ? 1 : 0 }} />
            {/* Bad app */}
            <div className="flex items-center gap-1.5 w-[80px] shrink-0">
              <a.bI className="text-lg opacity-60" style={{ color: a.bC }} />
              <span className="text-xs text-[#6C6775] line-through">{a.bad}</span>
            </div>
            {/* Arrow */}
            <motion.div animate={{ x: hover===i ? 4 : 0 }} className="text-[#6C6775]">
              <ArrowRight className="h-4 w-4" />
            </motion.div>
            {/* Good app */}
            <a.gI className="text-xl shrink-0" style={{ color: a.gC }} />
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#3D3A45]">{a.good}</div>
              <div className="text-[10px] text-[#6C6775] truncate">{a.why}</div>
            </div>
            {hover===i && (
              <motion.div initial={{ opacity:0,scale:0 }} animate={{ opacity:1,scale:1 }}
                className="ml-auto shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: a.gC }}>✓ Safer</motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </BaseCard>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
const stagger = {
  hidden: { opacity:0 },
  show:   { opacity:1, transition:{ staggerChildren:0.08 } }
};
const rise = {
  hidden: { opacity:0, y:28 },
  show:   { opacity:1, y:0, transition:{ type:"spring" as const, stiffness:280, damping:24 } }
};

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowModal(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden text-[#3D3A45] font-sans"
      style={{ background:"linear-gradient(160deg,#fdf8f2 0%,#f8f3fc 50%,#f2f8f5 100%)" }}>

      <GhibliModal open={showModal} onClose={() => setShowModal(false)} />

      {/* Hero */}
      <div className="relative flex flex-col items-center text-center pt-16 pb-10 px-4 overflow-hidden">
        {PARTICLES.map((p,i) => <Particle key={i} {...p} />)}
        <motion.div animate={{ y:[0,-14,0], rotate:[0,4,0,-4,0] }} transition={{ duration:6, repeat:Infinity, ease:"easeInOut" }}
          className="mb-6 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FFE5EC] to-[#F3E8FF] blur-2xl opacity-70 rounded-full" />
          <div className="relative h-24 w-24 rounded-[2rem] flex items-center justify-center shadow-xl border-2 border-white rotate-3"
            style={{ background:"linear-gradient(135deg,#FFE5EC,#F3E8FF,#EAF7ED)" }}>
            <Shield className="h-12 w-12 text-[#7D52B3]" />
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="text-5xl md:text-6xl font-heading font-bold text-[#3D3A45] mb-2 tracking-tight">
          FirstShield
        </motion.h1>
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.35 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 text-sm font-bold"
          style={{ background:"linear-gradient(135deg,#7D52B3,#4A90E2)", color:"white" }}>
          <Shield className="h-3.5 w-3.5" /> #1 App to Install Before Any Other App
        </motion.div>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
          className="text-lg text-[#6C6775] font-medium max-w-xl leading-relaxed">
          Before you download anything else — download your shield first.<br/>
          <span className="text-[#7D52B3] font-bold">Privacy. Health. Safety. All in one.</span>
        </motion.p>
        {/* badges */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          className="flex gap-3 mt-5 flex-wrap justify-center">
          {[
            { icon:<Lock className="h-3.5 w-3.5" />, label:"Privacy First", color:"bg-[#F3E8FF] text-[#7D52B3]" },
            { icon:<Heart className="h-3.5 w-3.5" />, label:"Health Focused", color:"bg-[#FFE5EC] text-[#E57373]" },
            { icon:<Star className="h-3.5 w-3.5" />,  label:"100% Free", color:"bg-[#FFF2CC] text-[#D4A373]" },
          ].map((b,i) => (
            <span key={i} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${b.color}`}>
              {b.icon} {b.label}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Grid */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {[AppSafetyCard, PrivacyScoreCard, TermsCard, EyeHealthCard, PostureCard, SleepCard, NightTimeCard, WifiSafetyCard, SaferAppsCard].map((Card,i) => (
          <motion.div key={i} variants={rise}><Card /></motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="bg-[#EAF7ED] border-t border-[#C8E6C9] py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-bold text-[#2E5A44] flex items-center justify-center gap-2 flex-wrap text-sm">
            <Shield className="h-5 w-5 text-[#62B685]" />
            100% Privacy Guarantee — This app collects zero data. No permissions required. Your safety is our only goal.
          </p>
        </div>
      </div>
    </div>
  );
}
