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
const WIFI_WARNINGS = [
  { icon:"🌐", title:"Public Wi-Fi is never private", desc:"Anyone on the same network can intercept your traffic. Avoid logging into accounts on café, hotel, or airport Wi-Fi.", color:"bg-[#FFF5F5] border-[#FECACA] text-[#C62828]" },
  { icon:"🕵️", title:"Man-in-the-middle attacks", desc:"Hackers set up fake hotspots with names like \"Airport_Free_WiFi\". Your device connects thinking it's legitimate.", color:"bg-[#FFF2CC] border-[#FDE68A] text-[#92400E]" },
  { icon:"🏦", title:"Never do banking on open networks", desc:"Online banking, payments, or entering passwords on unsecured Wi-Fi puts your accounts at serious risk.", color:"bg-[#FFF5F5] border-[#FECACA] text-[#C62828]" },
  { icon:"🔓", title:"Unsecured home routers", desc:"Default router passwords (\"admin/admin\") are publicly known. Change yours immediately to a strong unique password.", color:"bg-[#FFF2CC] border-[#FDE68A] text-[#92400E]" },
  { icon:"📡", title:"Auto-join networks silently connect you", desc:"When your phone auto-joins known networks, it can connect to an attacker's hotspot with the same name without warning.", color:"bg-[#F3E8FF] border-[#DDD6FE] text-[#5B21B6]" },
];

const TIPS = [
  { icon:"🔐", tip:"Use a VPN on public Wi-Fi (cafés, trains)", color:"bg-[#E8F0FE] text-[#1565C0]" },
  { icon:"🏦", tip:"Never do banking on open/unsecured networks", color:"bg-[#FFE5EC] text-[#C62828]" },
  { icon:"📵", tip:"Keep Bluetooth OFF when not actively using it", color:"bg-[#EAF7ED] text-[#2E7D32]" },
  { icon:"🎧", tip:"Headphone volume max 60% — 60 min limit (60/60 rule)", color:"bg-[#FFF2CC] text-[#E65100]" },
  { icon:"🛌", tip:"Never sleep with phone under your pillow", color:"bg-[#F3E8FF] text-[#512DA8]" },
  { icon:"🔑", tip:"Confirm network is password-protected before connecting", color:"bg-[#E8F5E9] text-[#1B5E20]" },
];

function WifiSafetyCard() {
  return (
    <BaseCard icon={Wifi} iconBg="bg-[#FFF2CC]" iconColor="#D97706" title="Wi-Fi Safety Warnings" accent="#D97706">
      <div className="bg-[#FFF5F5] border border-[#FECACA] rounded-2xl p-3.5 mb-5 flex items-center gap-3 text-sm text-[#C62828]">
        <AlertTriangle className="h-5 w-5 shrink-0 text-[#EF4444]" />
        <p><strong>Wi-Fi networks can be dangerous</strong> — especially public ones. Know the risks before connecting.</p>
      </div>

      <p className="text-xs font-bold text-[#6C6775] uppercase tracking-wide mb-3">⚠ Real Risks to Watch Out For</p>
      <div className="space-y-3 mb-5">
        {WIFI_WARNINGS.map((w, i) => (
          <motion.div key={i} whileHover={{ x: 4 }}
            className={`flex gap-3 p-3.5 rounded-2xl border text-xs ${w.color}`}>
            <span className="text-xl shrink-0">{w.icon}</span>
            <div>
              <p className="font-bold mb-0.5">{w.title}</p>
              <p className="leading-snug opacity-80">{w.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs font-bold text-[#3D3A45] mb-3 flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-[#D4A373]" /> How to Stay Safe
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

// ── Card: App Permission Lookup (Exodus-style) ───────────────────────────────
const APP_DB: Record<string, { trackers: number; risk: "low"|"medium"|"high"; perms: {icon:string; name:string; why:string; danger:"safe"|"warn"|"danger"}[] }> = {
  "whatsapp":    { trackers:3, risk:"medium", perms:[
    { icon:"🎤", name:"Microphone", why:"Voice calls & voice messages", danger:"warn" },
    { icon:"📷", name:"Camera", why:"Photo & video sharing", danger:"warn" },
    { icon:"📍", name:"Location", why:"Share your live location", danger:"warn" },
    { icon:"👥", name:"Contacts", why:"Find friends on WhatsApp", danger:"danger" },
    { icon:"💾", name:"Storage", why:"Save & share media files", danger:"safe" },
  ]},
  "instagram":   { trackers:7, risk:"high", perms:[
    { icon:"📷", name:"Camera", why:"Post photos & reels", danger:"warn" },
    { icon:"📍", name:"Location", why:"Tag location in posts", danger:"danger" },
    { icon:"👥", name:"Contacts", why:"Find friends — also shares with Facebook", danger:"danger" },
    { icon:"🎤", name:"Microphone", why:"Record videos & reels", danger:"warn" },
    { icon:"📱", name:"Phone ID", why:"Links your device to Facebook's ad system", danger:"danger" },
  ]},
  "facebook":    { trackers:9, risk:"high", perms:[
    { icon:"📍", name:"Location", why:"Location-based ads & check-ins", danger:"danger" },
    { icon:"👥", name:"Contacts", why:"People you may know — sold to advertisers", danger:"danger" },
    { icon:"📷", name:"Camera", why:"Photos & videos", danger:"warn" },
    { icon:"📱", name:"Phone ID", why:"Tracks you across all websites", danger:"danger" },
    { icon:"📞", name:"Call History", why:"Knows who you call", danger:"danger" },
  ]},
  "tiktok":      { trackers:6, risk:"high", perms:[
    { icon:"📷", name:"Camera", why:"Record videos", danger:"warn" },
    { icon:"🎤", name:"Microphone", why:"Audio for videos", danger:"warn" },
    { icon:"📍", name:"Location", why:"Sent to overseas servers", danger:"danger" },
    { icon:"📋", name:"Clipboard", why:"Reads what you copy-paste", danger:"danger" },
    { icon:"👥", name:"Contacts", why:"Suggest friends to follow", danger:"danger" },
  ]},
  "youtube":     { trackers:4, risk:"medium", perms:[
    { icon:"📷", name:"Camera", why:"Record & upload videos", danger:"warn" },
    { icon:"🎤", name:"Microphone", why:"Voice search", danger:"safe" },
    { icon:"💾", name:"Storage", why:"Download videos offline", danger:"safe" },
    { icon:"📍", name:"Location", why:"Local content recommendations", danger:"warn" },
  ]},
  "snapchat":    { trackers:5, risk:"high", perms:[
    { icon:"📷", name:"Camera", why:"Snaps & stories", danger:"warn" },
    { icon:"📍", name:"Location", why:"Snap Map shows friends your exact location", danger:"danger" },
    { icon:"👥", name:"Contacts", why:"Find friends — stores contact data", danger:"danger" },
    { icon:"🎤", name:"Microphone", why:"Video snaps", danger:"warn" },
  ]},
  "google maps": { trackers:3, risk:"medium", perms:[
    { icon:"📍", name:"Location (Always)", why:"Navigation — but tracks even in background", danger:"danger" },
    { icon:"🎤", name:"Microphone", why:"Voice navigation commands", danger:"safe" },
    { icon:"📷", name:"Camera", why:"Street View & place photos", danger:"safe" },
  ]},
  "chrome":      { trackers:5, risk:"high", perms:[
    { icon:"📍", name:"Location", why:"Local search results", danger:"warn" },
    { icon:"📷", name:"Camera", why:"QR code scanner", danger:"safe" },
    { icon:"🎤", name:"Microphone", why:"Voice search", danger:"warn" },
    { icon:"💾", name:"Storage", why:"Downloads & cache", danger:"safe" },
    { icon:"🍪", name:"All Browsing Data", why:"Builds a profile of everything you browse", danger:"danger" },
  ]},
  "telegram":    { trackers:1, risk:"low", perms:[
    { icon:"🎤", name:"Microphone", why:"Voice & video calls", danger:"safe" },
    { icon:"📷", name:"Camera", why:"Share photos & videos", danger:"safe" },
    { icon:"👥", name:"Contacts", why:"Find friends on Telegram", danger:"warn" },
    { icon:"💾", name:"Storage", why:"Save media files", danger:"safe" },
  ]},
  "signal":      { trackers:0, risk:"low", perms:[
    { icon:"🎤", name:"Microphone", why:"Encrypted voice calls only", danger:"safe" },
    { icon:"📷", name:"Camera", why:"Encrypted photo sharing", danger:"safe" },
    { icon:"👥", name:"Contacts", why:"Find friends — never uploaded to servers", danger:"safe" },
  ]},
  "uber":        { trackers:4, risk:"medium", perms:[
    { icon:"📍", name:"Location (Always)", why:"Tracks location even between rides", danger:"danger" },
    { icon:"📞", name:"Phone", why:"Call driver without revealing your number", danger:"safe" },
    { icon:"📷", name:"Camera", why:"QR code check-in & ID verification", danger:"safe" },
  ]},
  "amazon":      { trackers:6, risk:"high", perms:[
    { icon:"📷", name:"Camera", why:"Visual search & product scan", danger:"safe" },
    { icon:"🎤", name:"Microphone", why:"Alexa voice shopping", danger:"warn" },
    { icon:"📍", name:"Location", why:"Delivery address & local deals", danger:"warn" },
    { icon:"🛍", name:"Purchase History", why:"Builds detailed shopping profile sold to brands", danger:"danger" },
  ]},
  "netflix":     { trackers:3, risk:"low", perms:[
    { icon:"📷", name:"Camera", why:"QR code login", danger:"safe" },
    { icon:"💾", name:"Storage", why:"Download shows offline", danger:"safe" },
    { icon:"📺", name:"Watch History", why:"Tracks every pause, rewind & skip", danger:"warn" },
  ]},
  "spotify":     { trackers:4, risk:"medium", perms:[
    { icon:"📷", name:"Camera", why:"QR code & profile photo", danger:"safe" },
    { icon:"📍", name:"Location", why:"Local events & artist suggestions", danger:"warn" },
    { icon:"🎵", name:"Listen History", why:"Tracks mood patterns through music choices", danger:"warn" },
    { icon:"👥", name:"Contacts", why:"Friend activity feature", danger:"warn" },
  ]},
  "gmail":       { trackers:5, risk:"high", perms:[
    { icon:"📧", name:"All Emails", why:"Google scans emails for targeted ads", danger:"danger" },
    { icon:"👥", name:"Contacts", why:"Auto-complete & Google social graph", danger:"warn" },
    { icon:"📷", name:"Camera", why:"Attach photos in emails", danger:"safe" },
    { icon:"💾", name:"Storage", why:"Save email attachments", danger:"safe" },
  ]},
  "zoom":        { trackers:3, risk:"medium", perms:[
    { icon:"🎤", name:"Microphone", why:"Meeting audio", danger:"safe" },
    { icon:"📷", name:"Camera", why:"Video meetings", danger:"safe" },
    { icon:"💾", name:"Storage", why:"Record meetings locally", danger:"warn" },
    { icon:"📱", name:"Screen Recording", why:"Can record your entire screen", danger:"warn" },
  ]},
};

const riskConfig = {
  low:    { label:"Low Risk",   color:"text-[#2E7D32]", bg:"bg-[#EAF7ED]", bar:"#62B685", score:85 },
  medium: { label:"Some Risk",  color:"text-[#E65100]", bg:"bg-[#FFF2CC]", bar:"#D4A373", score:55 },
  high:   { label:"High Risk",  color:"text-[#C62828]", bg:"bg-[#FFE5EC]", bar:"#E57373", score:25 },
};
const dangerConfig = {
  safe:   { dot:"bg-[#62B685]", label:"Safe" },
  warn:   { dot:"bg-[#D4A373]", label:"Watch out" },
  danger: { dot:"bg-[#E57373]", label:"Danger" },
};

function AppPermissionCard() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof APP_DB[string]|null>(null);
  const [searched, setSearched] = useState("");
  const POPULAR = ["WhatsApp","Instagram","TikTok","YouTube","Chrome","Telegram","Spotify","Netflix"];

  const lookup = (name: string) => {
    const key = name.toLowerCase().trim();
    sfx.click();
    const found = APP_DB[key];
    setSearched(name);
    setResult(found || null);
  };

  const rc = result ? riskConfig[result.risk] : null;

  return (
    <BaseCard icon={Smartphone} iconBg="bg-[#E8F0FE]" iconColor="#4A90E2" title="App Permission Lookup" accent="#4A90E2">
      <p className="text-xs text-[#6C6775] mb-3 leading-relaxed">
        Type any app name to instantly see what data it collects from your phone 👇
      </p>

      {/* Search bar */}
      <div className="flex gap-2 mb-3">
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key==="Enter" && query.trim() && lookup(query)}
          placeholder="e.g. Instagram, TikTok..."
          className="flex-1 px-4 py-2.5 rounded-2xl border border-[#EDE7DE] bg-[#FCF9F5] text-sm focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/20 transition-all"
        />
        <motion.button whileTap={{ scale:0.92 }} onClick={() => query.trim() && lookup(query)}
          className="px-4 py-2.5 rounded-2xl text-white text-sm font-bold"
          style={{ background:"linear-gradient(135deg,#4A90E2,#7D52B3)" }}>
          Check
        </motion.button>
      </div>

      {/* Popular chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {POPULAR.map(app => (
          <button key={app} onClick={() => { setQuery(app); lookup(app); }}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E8F0FE] text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white transition-colors">
            {app}
          </button>
        ))}
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && rc && (
          <motion.div key={searched} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            {/* Header */}
            <div className={`flex items-center justify-between p-3.5 rounded-2xl mb-3 ${rc.bg}`}>
              <div>
                <p className="font-heading font-bold text-base text-[#3D3A45]">{searched}</p>
                <p className={`text-xs font-bold ${rc.color}`}>{rc.label} — {result.trackers} hidden tracker{result.trackers!==1?"s":""} found</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-heading font-bold ${rc.color}`}>{rc.score}%</div>
                <div className="text-[10px] text-[#6C6775]">Privacy Score</div>
              </div>
            </div>
            {/* Score bar */}
            <div className="w-full h-2.5 bg-[#EDE7DE] rounded-full mb-4 overflow-hidden">
              <motion.div className="h-full rounded-full"
                initial={{ width:0 }} animate={{ width:`${rc.score}%` }}
                style={{ background: rc.bar }} transition={{ duration:0.8, ease:"easeOut" }} />
            </div>
            {/* Permissions list */}
            <p className="text-[10px] font-bold text-[#6C6775] uppercase tracking-wider mb-2">What this app accesses on your phone:</p>
            <div className="space-y-2">
              {result.perms.map((p,i) => {
                const dc = dangerConfig[p.danger];
                return (
                  <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FCF9F5] border border-[#EDE7DE]">
                    <span className="text-lg shrink-0">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[#3D3A45]">{p.name}</div>
                      <div className="text-[10px] text-[#6C6775] leading-snug">{p.why}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${dc.dot}`} />
                      <span className="text-[10px] font-bold text-[#6C6775]">{dc.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
        {searched && !result && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-6 text-sm text-[#6C6775]">
            <div className="text-3xl mb-2">🔍</div>
            <p className="font-bold">App not found in our database.</p>
            <p className="text-xs mt-1">Try a popular app above, or check its App Store listing manually.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </BaseCard>
  );
}

// ── Card: ToS Simplified (ToS;DR-style) ──────────────────────────────────────
const TOS_DB: Record<string, { grade:"A"|"B"|"C"|"D"|"E"; summary:string; green:string[]; red:string[] }> = {
  "Signal":     { grade:"A", summary:"Collects almost nothing. Open source. Trusted by security experts worldwide.",
    green:["Messages are fully encrypted — even Signal can't read them","Collects only your phone number — nothing else","Open source code — anyone can verify it's safe","No ads. No data selling. Ever."],
    red:["Requires a phone number to sign up (no anonymous accounts)"],
  },
  "Telegram":   { grade:"B", summary:"Good encryption for Secret Chats only. Regular chats are stored on Telegram's servers.",
    green:["Secret Chats are end-to-end encrypted","You can delete messages for both sides","No ads in personal chats"],
    red:["Regular group chats are NOT end-to-end encrypted","Telegram can read your cloud messages","Based in Dubai — legal jurisdiction is unclear"],
  },
  "WhatsApp":   { grade:"C", summary:"Messages are encrypted, but metadata (who you talk to, when, where) is fully shared with Facebook.",
    green:["Messages themselves are end-to-end encrypted","Can enable disappearing messages"],
    red:["Shares your contact list, phone number & usage data with Meta/Facebook","Backs up to Google Drive removes encryption","Accepts terms or lose access — no real choice"],
  },
  "Instagram":  { grade:"D", summary:"Heavily tracks you across the internet. Owns your photo licence. Sells your attention to advertisers.",
    green:["You can download your data","Account can be set to private"],
    red:["Gets a royalty-free licence to use your photos commercially","Tracks your activity on other websites and apps","Shares all data with Facebook advertising system","Algorithm designed to maximise screen time, not your wellbeing"],
  },
  "Facebook":   { grade:"E", summary:"One of the most extensive data collection operations on earth. Your data is the product.",
    green:["You can download a copy of your data","Can delete your account"],
    red:["Tracks you on millions of websites even when you're not using Facebook","Builds detailed psychological profiles for advertisers","Has faced billions in fines for privacy violations","Sells your data to third parties without clear consent","Facial recognition used on your photos"],
  },
  "TikTok":     { grade:"D", summary:"Extremely invasive data collection. Data sent to overseas servers. Clipboard access concerns.",
    green:["Can set account to private","Can delete videos you've posted"],
    red:["Collects keystroke patterns, clipboard content, and device fingerprint","Data sent to servers in China — subject to Chinese law","Algorithm tracks emotions and responses to manipulate your feed","Used by children — raised serious child safety concerns globally"],
  },
  "Google":     { grade:"C", summary:"Useful but builds a permanent profile of everything you do online.",
    green:["Google Takeout lets you download all your data","Two-step verification available","Can auto-delete history after 3/18 months"],
    red:["Tracks your location even with location history turned off","Voice recordings stored in Google servers","Every search, video, and click builds your advertising profile","Difficult to truly opt out — Google is embedded everywhere"],
  },
  "YouTube":    { grade:"C", summary:"Tracks watch history and habits extensively. Autoplay designed to keep you watching longer.",
    green:["Can clear and pause watch history","Premium removes ads","Can restrict content for kids with YouTube Kids"],
    red:["Tracks every video you watch, pause, or skip","Autoplay algorithm can lead to increasingly extreme content","Recommended algorithm prioritises engagement over accuracy"],
  },
  "Snapchat":   { grade:"D", summary:"Snaps may disappear from your screen but metadata and some content is kept.",
    green:["Snaps auto-delete by default","Can see who took a screenshot"],
    red:["Snap Map reveals your real-time location to friends","Snapchat keeps metadata of all messages","Has had major data breaches in the past","Stores and analyses facial data for filters"],
  },
  "Uber":       { grade:"C", summary:"Collects location continuously. Shares trip data with third parties.",
    green:["Trip history available to users","Can share trip with a trusted contact"],
    red:["Tracks your location continuously — even between trips","Shares ride data with advertisers and insurance companies","Surge pricing algorithm has been called manipulative"],
  },
  "Netflix":    { grade:"B", summary:"Relatively fair. Doesn't sell your data. Tracks viewing habits for recommendations.",
    green:["Does not sell your data to advertisers","Transparent about data use","Can download content offline"],
    red:["Tracks every pause, rewind, and skip to profile your behaviour","Password sharing crackdown affects paying users","Price increased significantly with no added user benefit"],
  },
  "Spotify":    { grade:"B", summary:"Reasonable policies. Tracks listening habits for recommendations and ads.",
    green:["Can download data","Transparent about ad-supported model","Family plan offers good value"],
    red:["Tracks mood patterns through music listening habits","Free tier users hear targeted ads based on behaviour","Shares listening data with brand partners"],
  },
};

const gradeConfig: Record<string,{ color:string; bg:string; border:string; label:string }> = {
  A: { color:"#2E7D32", bg:"#EAF7ED", border:"#A7D7B8", label:"Excellent" },
  B: { color:"#1565C0", bg:"#E8F0FE", border:"#C5D8FB", label:"Good" },
  C: { color:"#E65100", bg:"#FFF2CC", border:"#FDE68A", label:"Mixed" },
  D: { color:"#C62828", bg:"#FFE5EC", border:"#FECACA", label:"Bad" },
  E: { color:"#7B1FA2", bg:"#F3E8FF", border:"#DDD6FE", label:"Avoid!" },
};

function ToSCard() {
  const apps = Object.keys(TOS_DB);
  const [selected, setSelected] = useState("WhatsApp");
  const data = TOS_DB[selected];
  const gc = gradeConfig[data.grade];

  return (
    <BaseCard icon={FileText} iconBg="bg-[#FFF2CC]" iconColor="#D4A373" title="Terms — Plain & Simple" accent="#D4A373">
      <p className="text-xs text-[#6C6775] mb-3 leading-relaxed">
        We read the Terms of Service so you don't have to. Pick an app to see if it's honest with you 👇
      </p>

      {/* App selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {apps.map(app => (
          <button key={app} onClick={() => { setSelected(app); sfx.click(); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200
              ${selected===app ? "bg-[#3D3A45] text-white shadow" : "bg-[#FCF9F5] text-[#3D3A45] border border-[#EDE7DE] hover:border-[#3D3A45]"}`}>
            {app}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selected} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
          {/* Grade badge */}
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-4" style={{ background:gc.bg, border:`1.5px solid ${gc.border}` }}>
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background:gc.color }}>
              <span className="text-4xl font-heading font-bold text-white">{data.grade}</span>
            </div>
            <div>
              <p className="font-heading font-bold text-lg" style={{ color:gc.color }}>{selected} — {gc.label}</p>
              <p className="text-xs text-[#6C6775] leading-snug mt-0.5">{data.summary}</p>
            </div>
          </div>

          {/* Green points */}
          <div className="bg-[#EAF7ED] rounded-2xl p-3.5 mb-3">
            <p className="text-xs font-bold text-[#3A7D54] mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> What they do right
            </p>
            <div className="space-y-1.5">
              {data.green.map((g,i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#2E5A44]">
                  <span className="text-[#62B685] shrink-0 mt-0.5">✓</span> {g}
                </div>
              ))}
            </div>
          </div>

          {/* Red points */}
          <div className="bg-[#FFE5EC] rounded-2xl p-3.5">
            <p className="text-xs font-bold text-[#C94A4A] mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> What they do wrong
            </p>
            <div className="space-y-1.5">
              {data.red.map((r,i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#8B2020]">
                  <span className="text-[#E57373] shrink-0 mt-0.5">✕</span> {r}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </BaseCard>
  );
}

// ── Card: Privacy Architecture (100% Local) ──────────────────────────────────
const HOW_IT_WORKS = [
  {
    emoji:"🧠", title:"Everything lives in the app",
    desc:"All the permission data, ToS ratings, safety tips, and health guides are written directly into this app's code. Nothing is fetched from the internet.",
    color:"#7D52B3", bg:"#F3E8FF",
  },
  {
    emoji:"🚫", title:"Zero network requests from your data",
    desc:"When you search an app, tick a checklist, or take the quiz — that action stays entirely on your screen. No button sends anything anywhere.",
    color:"#16A34A", bg:"#DCFCE7",
  },
  {
    emoji:"🔇", title:"No microphone, camera, or location needed",
    desc:"Open your phone's Settings and check — FirstShield requests zero permissions. It cannot and does not access any sensor on your device.",
    color:"#4A90E2", bg:"#E8F0FE",
  },
  {
    emoji:"🍪", title:"No cookies. No tracking. No ads.",
    desc:"There is no login, no account, no ad system, and no analytics SDK anywhere in this app. Your usage patterns are invisible to us — because we never see them.",
    color:"#D97706", bg:"#FFF2CC",
  },
  {
    emoji:"📦", title:"Works fully offline",
    desc:"Once the page has loaded, you can turn off your internet and every feature still works perfectly. The app needs no connection to function.",
    color:"#E57373", bg:"#FFE5EC",
  },
  {
    emoji:"🔍", title:"Open for anyone to verify",
    desc:"Every piece of logic in this app is readable JavaScript. There is no hidden server, no secret endpoint, and no background process. What you see is what runs.",
    color:"#62B685", bg:"#EAF7ED",
  },
];

function PrivacyArchitectureCard() {
  const [expanded, setExpanded] = useState<number|null>(null);
  return (
    <BaseCard icon={Lock} iconBg="bg-[#EAF7ED]" iconColor="#16A34A" title="100% Local — How This App Works" accent="#16A34A">
      {/* Trust banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl mb-5 bg-gradient-to-r from-[#EAF7ED] to-[#E8F0FE] border border-[#62B685]/30">
        <svg viewBox="0 0 52 52" className="w-12 h-12 shrink-0">
          <circle cx="26" cy="26" r="24" fill="#EAF7ED" stroke="#62B685" strokeWidth="2"/>
          {/* Shield body */}
          <path d="M26 8 L42 15 L42 30 Q42 42 26 48 Q10 42 10 30 L10 15Z" fill="#62B685"/>
          <path d="M26 13 L37 18.5 L37 30 Q37 39 26 44 Q15 39 15 30 L15 18.5Z" fill="#86EFAC" opacity="0.5"/>
          {/* Tick */}
          <path d="M19 28 L24 33 L33 22" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <p className="font-bold text-sm text-[#2E5A44]">Your data never leaves your device</p>
          <p className="text-xs text-[#4A7A60] leading-snug mt-0.5">
            FirstShield is a read-only guide. It teaches you — it does not collect from you. Every scan, quiz, and checklist runs entirely in your browser's memory and is deleted the moment you close the tab.
          </p>
        </div>
      </div>

      {/* 6 points — tap to expand */}
      <p className="text-[10px] font-bold text-[#6C6775] uppercase tracking-wider mb-3">Tap any point to learn more:</p>
      <div className="space-y-2">
        {HOW_IT_WORKS.map((h,i) => {
          const open = expanded === i;
          return (
            <motion.div key={i} layout>
              <button onClick={() => { setExpanded(open ? null : i); sfx.click(); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-200"
                style={{ background: open ? h.bg : "#FCF9F5", border:`1.5px solid ${open ? h.color+"55" : "#EDE7DE"}` }}>
                <span className="text-xl shrink-0">{h.emoji}</span>
                <span className="flex-1 text-sm font-bold text-[#3D3A45]">{h.title}</span>
                <motion.span animate={{ rotate: open ? 90 : 0 }} className="text-[#6C6775] text-base shrink-0">›</motion.span>
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                    className="overflow-hidden">
                    <div className="px-4 pt-2 pb-3 text-xs text-[#3D3A45] leading-relaxed rounded-b-2xl -mt-2"
                      style={{ background: h.bg, borderLeft:`3px solid ${h.color}`, marginLeft:"8px" }}>
                      {h.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom seal */}
      <div className="mt-5 flex items-center justify-center gap-2 py-3 rounded-2xl"
        style={{ background:"linear-gradient(135deg,#EAF7ED,#E8F0FE)", border:"1.5px solid #62B685" }}>
        <CheckCircle2 className="h-4 w-4 text-[#16A34A]"/>
        <span className="text-xs font-bold text-[#2E5A44]">No API calls · No accounts · No ads · No tracking · Works offline</span>
      </div>
    </BaseCard>
  );
}

// ── Card: 2-Minute Quick Wins ────────────────────────────────────────────────
const QUICK_WINS = [
  {
    emoji:"🔒", title:"Lock your phone screen",
    desc:"Set a 6-digit PIN or fingerprint lock. This one step stops 90% of phone theft risks.",
    time:"30 sec", color:"#7D52B3", bg:"#F3E8FF",
  },
  {
    emoji:"👁️", title:"Check which apps can see your location",
    desc:'Go to Settings → Privacy → Location. Turn any social app from "Always" to "Never" or "While Using".',
    time:"1 min", color:"#E57373", bg:"#FFE5EC",
  },
  {
    emoji:"🔔", title:"Turn off notification previews",
    desc:"Stop your messages from showing on the lock screen for anyone nearby to read.",
    time:"30 sec", color:"#4A90E2", bg:"#E8F0FE",
  },
  {
    emoji:"🛜", title:"Use mobile data on public Wi-Fi",
    desc:"Coffee shop or mall Wi-Fi can be faked. When in doubt, switch to your mobile data instead.",
    time:"5 sec", color:"#16A34A", bg:"#DCFCE7",
  },
  {
    emoji:"🧹", title:"Delete apps you haven't used in 30 days",
    desc:"Old unused apps still run in the background and collect data. Delete them — you can always reinstall.",
    time:"2 min", color:"#D97706", bg:"#FFF2CC",
  },
];

function QuickWinsCard() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [celebrated, setCelebrated] = useState(false);
  const allDone = checked.size === QUICK_WINS.length;

  const toggle = (i: number) => {
    sfx.click();
    setChecked(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      if (n.size === QUICK_WINS.length) { sfx.success(); setCelebrated(true); }
      return n;
    });
  };

  return (
    <BaseCard icon={Zap} iconBg="bg-[#FFF2CC]" iconColor="#D4A373" title="2-Minute Quick Wins" accent="#D4A373">
      {/* Friendly intro */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#FDE68A]/60 mb-4">
        <svg viewBox="0 0 50 50" className="w-10 h-10 shrink-0">
          <circle cx="25" cy="25" r="22" fill="#FDE68A"/>
          <ellipse cx="18" cy="22" rx="3.5" ry="4" fill="white"/>
          <ellipse cx="32" cy="22" rx="3.5" ry="4" fill="white"/>
          <circle cx="18" cy="23" r="2" fill="#3D3A45"/>
          <circle cx="32" cy="23" r="2" fill="#3D3A45"/>
          <path d="M17 34 Q25 40 33 34" stroke="#3D3A45" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="19" cy="22" r="0.8" fill="white"/>
          <circle cx="33" cy="22" r="0.8" fill="white"/>
        </svg>
        <div>
          <p className="font-bold text-sm text-[#3D3A45]">You're already doing great! 🌟</p>
          <p className="text-xs text-[#6C6775] leading-snug mt-0.5">
            These 5 simple steps take under 2 minutes total. Tick each one off and feel instantly more secure.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2.5 bg-[#EDE7DE] rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#D4A373] to-[#62B685]"
            animate={{ width:`${(checked.size/QUICK_WINS.length)*100}%` }}
            transition={{ duration:0.5, ease:"easeOut" }} />
        </div>
        <span className="text-xs font-bold text-[#6C6775] shrink-0">{checked.size}/{QUICK_WINS.length}</span>
      </div>

      {/* Win items */}
      <div className="space-y-2.5 mb-4">
        {QUICK_WINS.map((w,i) => {
          const done = checked.has(i);
          return (
            <motion.button key={i} onClick={() => toggle(i)} whileTap={{ scale:0.97 }}
              className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all duration-200"
              style={{ background: done ? w.bg : "#FCF9F5", border:`1.5px solid ${done ? w.color+"55" : "#EDE7DE"}` }}>
              {/* Checkbox */}
              <motion.div animate={{ scale: done ? [1,1.3,1] : 1 }} transition={{ duration:0.3 }}
                className="mt-0.5 h-6 w-6 rounded-full shrink-0 flex items-center justify-center border-2 transition-all"
                style={{ borderColor: done ? w.color : "#C4B5FD", background: done ? w.color : "white" }}>
                {done && <span className="text-white text-xs font-bold">✓</span>}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base">{w.emoji}</span>
                  <span className={`text-sm font-bold ${done ? "line-through opacity-60" : "text-[#3D3A45]"}`}>{w.title}</span>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background:w.bg, color:w.color }}>⏱ {w.time}</span>
                </div>
                <p className="text-xs text-[#6C6775] leading-snug">{w.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Celebration */}
      <AnimatePresence>
        {allDone && (
          <motion.div initial={{ opacity:0, y:10, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
            className="text-center p-4 rounded-2xl bg-gradient-to-br from-[#EAF7ED] to-[#F3E8FF] border border-[#62B685]/30">
            <div className="text-3xl mb-1">🎉</div>
            <p className="font-bold text-[#2E5A44]">Amazing! You're now safer than 80% of phone users.</p>
            <p className="text-xs text-[#6C6775] mt-1">Share FirstShield with a friend so they can do this too!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </BaseCard>
  );
}

// ── Card: Digital Health Quiz ─────────────────────────────────────────────────
const QUIZ = [
  {
    q:"How often do you check your phone at night after 10 PM?",
    opts:["Rarely or never 😴","Sometimes on weekends 🌙","Most nights 📱","Every night before sleeping 😰"],
    scores:[10,6,3,0],
    tip:"Phones before bed block melatonin and steal 1–2 hours of deep sleep. Try charging your phone outside the bedroom!",
  },
  {
    q:"Do you use the same password on multiple apps?",
    opts:["No — I use different passwords 🔐","Sometimes — for less important apps 🤔","Yes — it's easier to remember 😅","Yes — same password for everything 😬"],
    scores:[10,6,3,0],
    tip:'Use a passphrase instead — e.g. "Mango!Rain#Tree2024" — easy to remember but hard to crack!',
  },
  {
    q:"How long do you spend on your phone daily?",
    opts:["Under 2 hours ✅","2–4 hours — mostly work 💼","4–6 hours 📊","More than 6 hours 😳"],
    scores:[10,7,4,0],
    tip:"Try the 20-minute rule — every 20 minutes of phone use, take a 5-minute break. Your eyes and brain will thank you!",
  },
  {
    q:"Do you read app permissions before installing?",
    opts:["Yes, always 🔍","Sometimes if it looks suspicious 🤨","Rarely — I just tap Accept 😅","Never — I install and forget 🙈"],
    scores:[10,6,2,0],
    tip:'Next time you install an app, ask: "Does a torch app really need my contacts?" If the answer is no — deny it!',
  },
  {
    q:"Do you have a PIN/fingerprint lock on your phone?",
    opts:["Yes, 6-digit PIN + fingerprint 🔒","Yes, fingerprint only 👆","Yes, simple 4-digit PIN 🔑","No lock — too inconvenient 🚪"],
    scores:[10,8,5,0],
    tip:"A 6-digit PIN + fingerprint is the sweet spot. It takes 0.5 seconds to unlock but adds years of protection!",
  },
];

function DigitalHealthQuizCard() {
  const [step, setStep] = useState<number>(-1); // -1 = intro
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const score = answers.reduce((a,b) => a+b, 0);
  const maxScore = QUIZ.length * 10;
  const pct = Math.round((score / maxScore) * 100);

  const { label, emoji, color, bg, msg } = pct >= 80
    ? { label:"Digital Champion", emoji:"🏆", color:"#16A34A", bg:"#EAF7ED",
        msg:"You have excellent digital habits! Keep it up and share your knowledge with friends and family." }
    : pct >= 55
    ? { label:"Safety Aware", emoji:"🛡️", color:"#4A90E2", bg:"#E8F0FE",
        msg:"You're on the right track! A few small changes will make a big difference to your privacy and health." }
    : pct >= 30
    ? { label:"Getting Started", emoji:"🌱", color:"#D97706", bg:"#FFF2CC",
        msg:"Every expert was once a beginner. The fact you're here means you care — and that's the most important step!" }
    : { label:"Room to Grow", emoji:"💪", color:"#7D52B3", bg:"#F3E8FF",
        msg:"No judgment at all! You now know what to improve. Start with just one Quick Win from the card above." };

  const answer = (score: number) => {
    sfx.click();
    const next = [...answers, score];
    setAnswers(next);
    if (next.length === QUIZ.length) { sfx.success(); setDone(true); }
    else setStep(s => s+1);
  };

  const reset = () => { setStep(-1); setAnswers([]); setDone(false); sfx.click(); };

  const wrongTip = done && answers.length > 0
    ? QUIZ[answers.indexOf(Math.min(...answers))]?.tip
    : null;

  return (
    <BaseCard icon={Heart} iconBg="bg-[#FFE5EC]" iconColor="#E57373" title="Digital Health Check" accent="#E57373">
      <AnimatePresence mode="wait">

        {/* Intro */}
        {step === -1 && !done && (
          <motion.div key="intro" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className="text-center py-2">
              <div className="text-6xl mb-3">🧘</div>
              <p className="font-bold text-[#3D3A45] mb-2">How healthy are your digital habits?</p>
              <p className="text-xs text-[#6C6775] leading-relaxed mb-5">
                5 friendly questions. No right or wrong answers — just honest ones. Takes under a minute!
              </p>
              <div className="flex gap-2 justify-center flex-wrap mb-5">
                {["📱 Phone Use","🔐 Passwords","👁 Privacy","💤 Sleep","🛡 Security"].map((tag,i) => (
                  <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFE5EC] text-[#E57373]">{tag}</span>
                ))}
              </div>
              <motion.button whileTap={{ scale:0.95 }} onClick={() => { sfx.click(); setStep(0); }}
                className="px-8 py-3 rounded-2xl text-white font-bold text-sm shadow-md"
                style={{ background:"linear-gradient(135deg,#E57373,#7D52B3)" }}>
                Start My Health Check ✨
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Question */}
        {step >= 0 && !done && (
          <motion.div key={`q${step}`} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center mb-4">
              {QUIZ.map((_,i) => (
                <div key={i} className="h-2 rounded-full transition-all duration-300"
                  style={{ width: i===step ? 20 : 8, background: i<step ? "#62B685" : i===step ? "#E57373" : "#EDE7DE" }} />
              ))}
            </div>
            <p className="text-xs font-bold text-[#6C6775] uppercase tracking-wider mb-2">Question {step+1} of {QUIZ.length}</p>
            <p className="font-bold text-sm text-[#3D3A45] leading-snug mb-4">{QUIZ[step].q}</p>
            <div className="space-y-2">
              {QUIZ[step].opts.map((opt,i) => (
                <motion.button key={i} whileTap={{ scale:0.97 }} onClick={() => answer(QUIZ[step].scores[i])}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm border border-[#EDE7DE] bg-[#FCF9F5] hover:border-[#E57373]/50 hover:bg-[#FFE5EC]/30 transition-all font-medium text-[#3D3A45]">
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Result */}
        {done && (
          <motion.div key="result" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}>
            {/* Score ring */}
            <div className="flex flex-col items-center py-3 mb-4">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#EDE7DE" strokeWidth="10"/>
                  <motion.circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
                    stroke={color} strokeDasharray={`${2*Math.PI*42}`}
                    initial={{ strokeDashoffset: 2*Math.PI*42 }}
                    animate={{ strokeDashoffset: 2*Math.PI*42*(1-pct/100) }}
                    transition={{ duration:1.2, ease:"easeOut" }}/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-heading font-bold" style={{ color }}>{pct}%</span>
                  <span className="text-[10px] text-[#6C6775] font-bold">score</span>
                </div>
              </div>
              <div className="text-3xl mt-2">{emoji}</div>
              <p className="font-heading font-bold text-lg mt-1" style={{ color }}>{label}</p>
            </div>
            {/* Message */}
            <div className="p-3.5 rounded-2xl mb-3" style={{ background:bg }}>
              <p className="text-xs text-[#3D3A45] leading-relaxed">{msg}</p>
            </div>
            {/* Best tip */}
            {wrongTip && (
              <div className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#FDE68A]/60 mb-4">
                <p className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider mb-1">💡 Your top tip to improve:</p>
                <p className="text-xs text-[#3D3A45] leading-relaxed">{wrongTip}</p>
              </div>
            )}
            <button onClick={reset}
              className="w-full py-2.5 rounded-2xl text-xs font-bold border border-[#EDE7DE] text-[#6C6775] hover:bg-[#FCF9F5] transition-colors">
              Retake Quiz 🔄
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </BaseCard>
  );
}

// ── Card: Privacy Action Plan ─────────────────────────────────────────────────
const PERMISSIONS = [
  {
    id:"location", emoji:"📍", name:"Location", color:"#E57373", bg:"#FFE5EC", light:"#FFF0F3",
    tagline:"Apps that track where you go, even when closed",
    culprits:[
      { app:"Facebook",  risk:"Tracks you 24/7 for ad targeting" },
      { app:"Instagram", risk:"Shares location data with Meta" },
      { app:"TikTok",   risk:"Sends location to overseas servers" },
      { app:"Snapchat",  risk:"Snap Map reveals your exact location to friends" },
      { app:"Google Maps",risk:"Tracks movement even in background" },
    ],
    android:[
      "Open ⚙️ Settings on your phone",
      "Tap Apps (or App Manager)",
      "Select the app (e.g. Facebook)",
      "Tap Permissions → Location",
      'Change from "Allow all the time" → "Only while using app" or "Deny"',
    ],
    iphone:[
      "Open ⚙️ Settings on your iPhone",
      "Scroll down and tap the app name (e.g. Instagram)",
      "Tap Location",
      'Change to "Never" or "While Using App"',
      "Repeat for each app you want to restrict",
    ],
    cartoon: (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Body */}
        <ellipse cx="60" cy="72" rx="22" ry="18" fill="#FBBF24"/>
        {/* Head */}
        <circle cx="60" cy="45" r="20" fill="#FDE68A"/>
        {/* Worried eyes */}
        <ellipse cx="53" cy="42" rx="4" ry="5" fill="white"/>
        <ellipse cx="67" cy="42" rx="4" ry="5" fill="white"/>
        <circle cx="53" cy="44" r="2.5" fill="#3D3A45"/>
        <circle cx="67" cy="44" r="2.5" fill="#3D3A45"/>
        {/* Frown */}
        <path d="M53 54 Q60 50 67 54" stroke="#3D3A45" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Sweat drop */}
        <ellipse cx="76" cy="38" rx="3" ry="4" fill="#60A5FA" opacity="0.8"/>
        {/* Location pin above head */}
        <path d="M60 10 C53 10 47 16 47 23 C47 31 60 42 60 42 C60 42 73 31 73 23 C73 16 67 10 60 10Z" fill="#E57373"/>
        <circle cx="60" cy="23" r="5" fill="white"/>
        {/* Arms */}
        <line x1="38" y1="68" x2="25" y2="60" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round"/>
        <line x1="82" y1="68" x2="95" y2="60" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round"/>
        {/* Legs */}
        <line x1="52" y1="88" x2="48" y2="100" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round"/>
        <line x1="68" y1="88" x2="72" y2="100" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id:"contacts", emoji:"👥", name:"Contacts", color:"#7B52B3", bg:"#F3E8FF", light:"#FAF5FF",
    tagline:"Apps that upload your entire phone book to their servers",
    culprits:[
      { app:"Facebook",  risk:"Maps your social network for ad targeting" },
      { app:"WhatsApp",  risk:"Uploads all contacts to Meta's servers" },
      { app:"TikTok",   risk:"Stores contact list to suggest 'people you know'" },
      { app:"LinkedIn",  risk:"Scans contacts to suggest connections" },
      { app:"Snapchat",  risk:"Keeps contact data even after you delete the app" },
    ],
    android:[
      "Open ⚙️ Settings → Apps",
      "Select the app (e.g. TikTok)",
      "Tap Permissions → Contacts",
      'Tap "Deny"',
      "The app will still work — it just can't steal your address book",
    ],
    iphone:[
      "Open ⚙️ Settings → Privacy & Security",
      "Tap Contacts",
      "You'll see every app that has access",
      "Toggle OFF any app that doesn't truly need it",
      "Tip: Messaging apps need it, games & shopping apps never do",
    ],
    cartoon: (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Phone body */}
        <rect x="30" y="20" width="60" height="75" rx="8" fill="#7B52B3"/>
        <rect x="34" y="28" width="52" height="55" rx="4" fill="#EDE9FE"/>
        {/* Contact cards */}
        <rect x="38" y="32" width="44" height="12" rx="3" fill="white"/>
        <circle cx="46" cy="38" r="4" fill="#A78BFA"/>
        <rect x="54" y="35" width="20" height="2.5" rx="1" fill="#C4B5FD"/>
        <rect x="54" y="39" width="14" height="2" rx="1" fill="#DDD6FE"/>
        <rect x="38" y="48" width="44" height="12" rx="3" fill="white"/>
        <circle cx="46" cy="54" r="4" fill="#F87171"/>
        <rect x="54" y="51" width="20" height="2.5" rx="1" fill="#FCA5A5"/>
        <rect x="54" y="55" width="14" height="2" rx="1" fill="#FEE2E2"/>
        {/* Thief hand reaching out */}
        <path d="M90 55 L110 45 L108 60 L90 62Z" fill="#F59E0B" opacity="0.9"/>
        <circle cx="110" cy="50" r="6" fill="#FDE68A"/>
        {/* Warning mark */}
        <circle cx="95" cy="30" r="10" fill="#E57373"/>
        <text x="95" y="34" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">!</text>
      </svg>
    ),
  },
  {
    id:"microphone", emoji:"🎤", name:"Microphone", color:"#D97706", bg:"#FFF2CC", light:"#FFFBEB",
    tagline:"Apps that may listen even when you're not using them",
    culprits:[
      { app:"Facebook",  risk:"Allegations of listening for ad targeting (denied but suspected)" },
      { app:"TikTok",   risk:"Mic access active during app use — unclear when it stops" },
      { app:"Instagram", risk:"Always-on mic permission requested by default" },
      { app:"Snapchat",  risk:"Microphone on during any screen time in app" },
      { app:"Google",    risk:"Hey Google hotword detection runs continuously" },
    ],
    android:[
      "Open ⚙️ Settings → Privacy → Permission Manager",
      "Tap Microphone",
      "Review every app listed there",
      'For social apps: change to "Only while using"',
      'For apps that have no reason: tap "Deny"',
    ],
    iphone:[
      "Open ⚙️ Settings → Privacy & Security",
      "Tap Microphone",
      "See every app with mic access",
      "Toggle OFF any social or shopping app",
      "Only keep ON: Phone, WhatsApp, Zoom, voice recorder apps",
    ],
    cartoon: (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Microphone */}
        <rect x="50" y="15" width="20" height="35" rx="10" fill="#D97706"/>
        <rect x="50" y="15" width="20" height="35" rx="10" fill="url(#micGrad)" opacity="0.4"/>
        {/* Mic stand */}
        <path d="M38 50 Q60 65 82 50" stroke="#92400E" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <line x1="60" y1="63" x2="60" y2="82" stroke="#92400E" strokeWidth="3"/>
        <line x1="45" y1="82" x2="75" y2="82" stroke="#92400E" strokeWidth="3" strokeLinecap="round"/>
        {/* Sound waves */}
        <path d="M88 30 Q95 40 88 50" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
        <path d="M94 25 Q104 40 94 55" stroke="#FCD34D" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
        {/* Eye on mic (spy element) */}
        <ellipse cx="60" cy="32" rx="7" ry="5" fill="white"/>
        <circle cx="60" cy="32" r="3" fill="#92400E"/>
        <circle cx="61" cy="31" r="1" fill="white"/>
        {/* Defs */}
        <defs>
          <linearGradient id="micGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id:"camera", emoji:"📷", name:"Camera", color:"#16A34A", bg:"#DCFCE7", light:"#F0FDF4",
    tagline:"Apps that can silently activate your camera",
    culprits:[
      { app:"Instagram", risk:"Camera stays ready even on home screen of the app" },
      { app:"Snapchat",  risk:"Opens camera immediately — always watching" },
      { app:"TikTok",   risk:"Camera access during entire session, not just recording" },
      { app:"Facebook",  risk:"Face recognition on all photos you upload" },
      { app:"WhatsApp",  risk:"Camera permission active during all app sessions" },
    ],
    android:[
      "Open ⚙️ Settings → Privacy → Permission Manager",
      "Tap Camera",
      "Review all apps listed",
      'Set social apps to "Only while using"',
      'For any app you don\'t recognize: tap "Deny" immediately',
    ],
    iphone:[
      "Open ⚙️ Settings → Privacy & Security",
      "Tap Camera",
      "Toggle OFF every app that isn't a camera, video, or scan app",
      "Instagram, TikTok, Snapchat: set to 'Never' if you rarely use in-app camera",
      "You can always grant it again temporarily when needed",
    ],
    cartoon: (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Camera body */}
        <rect x="20" y="35" width="80" height="50" rx="8" fill="#16A34A"/>
        <rect x="20" y="35" width="80" height="50" rx="8" fill="white" opacity="0.1"/>
        {/* Lens */}
        <circle cx="60" cy="60" r="18" fill="#064E3B"/>
        <circle cx="60" cy="60" r="13" fill="#065F46"/>
        <circle cx="60" cy="60" r="8" fill="#047857"/>
        <circle cx="60" cy="60" r="4" fill="black"/>
        <circle cx="57" cy="57" r="1.5" fill="white" opacity="0.6"/>
        {/* Flash */}
        <rect x="75" y="40" width="16" height="10" rx="3" fill="#FCD34D"/>
        {/* Viewfinder */}
        <rect x="26" y="28" width="20" height="12" rx="3" fill="#16A34A"/>
        {/* Red recording dot */}
        <circle cx="95" cy="42" r="5" fill="#EF4444">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        {/* Spy figure reflected in lens */}
        <circle cx="60" cy="57" r="3" fill="#FDE68A" opacity="0.6"/>
        <line x1="60" y1="60" x2="58" y2="65" stroke="#FDE68A" strokeWidth="1.5" opacity="0.6"/>
        <line x1="60" y1="60" x2="62" y2="65" stroke="#FDE68A" strokeWidth="1.5" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id:"storage", emoji:"💾", name:"Storage & Files", color:"#4A90E2", bg:"#E8F0FE", light:"#EEF4FF",
    tagline:"Apps that read all your personal files, photos and documents",
    culprits:[
      { app:"Facebook",  risk:"Scans all photos for facial recognition data" },
      { app:"TikTok",   risk:"Reads device files to build a fingerprint of your phone" },
      { app:"WhatsApp",  risk:"Reads all media to enable sharing — stores copies on Meta servers" },
      { app:"Amazon",   risk:"Accesses photos to enable 'visual search' feature" },
      { app:"Loan apps", risk:"Scan your gallery for documents to use against you later" },
    ],
    android:[
      "Open ⚙️ Settings → Apps → [App Name]",
      "Tap Permissions → Files and Media",
      'Change to "Allow access to media files only" instead of "All files"',
      "For loan apps: DENY completely — they have no reason to read your files",
      "Check this for every app you didn't deliberately give storage access to",
    ],
    iphone:[
      "Open ⚙️ Settings → Privacy & Security → Photos",
      "See every app accessing your photo library",
      'Change suspicious apps from "All Photos" to "Selected Photos" or "None"',
      "Also check: Settings → Privacy & Security → Files and Folders",
      "No game, loan or shopping app should have any file access",
    ],
    cartoon: (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Folder */}
        <path d="M15 45 L15 90 L105 90 L105 45 Q105 38 98 38 L55 38 L48 28 L22 28 Q15 28 15 35Z" fill="#4A90E2"/>
        <path d="M15 50 L105 50 L105 90 L15 90Z" fill="#60A5FA"/>
        {/* Files inside */}
        <rect x="30" y="58" width="25" height="22" rx="2" fill="white" opacity="0.9"/>
        <rect x="60" y="58" width="25" height="22" rx="2" fill="white" opacity="0.9"/>
        {/* Photo icon on file */}
        <rect x="32" y="60" width="21" height="14" rx="1" fill="#E8F0FE"/>
        <circle cx="36" cy="64" r="2" fill="#FCD34D"/>
        <path d="M32 72 L38 66 L43 70 L48 65 L53 72Z" fill="#16A34A" opacity="0.7"/>
        {/* Document lines on second file */}
        <line x1="63" y1="63" x2="83" y2="63" stroke="#C4B5FD" strokeWidth="1.5"/>
        <line x1="63" y1="67" x2="80" y2="67" stroke="#C4B5FD" strokeWidth="1.5"/>
        <line x1="63" y1="71" x2="77" y2="71" stroke="#C4B5FD" strokeWidth="1.5"/>
        {/* Thief/spy hands grabbing */}
        <path d="M90 40 L115 30 L112 50 L90 52Z" fill="#FDE68A" opacity="0.85"/>
        <circle cx="113" cy="38" r="7" fill="#FBBF24"/>
        <path d="M108 34 L116 34 M112 30 L112 38" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// Tiny shield mascot SVG
function ShieldMascot({ happy }: { happy: boolean }) {
  return (
    <svg viewBox="0 0 60 70" className="w-14 h-14 shrink-0">
      <path d="M30 4 L54 14 L54 38 Q54 56 30 66 Q6 56 6 38 L6 14Z" fill={happy ? "#62B685" : "#E57373"}/>
      <path d="M30 10 L48 18 L48 38 Q48 52 30 60 Q12 52 12 38 L12 18Z" fill={happy ? "#86EFAC" : "#FCA5A5"} opacity="0.5"/>
      {/* Eyes */}
      <ellipse cx="23" cy="30" rx="4" ry={happy ? 3 : 4} fill="white"/>
      <ellipse cx="37" cy="30" rx="4" ry={happy ? 3 : 4} fill="white"/>
      <circle cx="23" cy={happy ? 30 : 31} r="2.5" fill="#3D3A45"/>
      <circle cx="37" cy={happy ? 30 : 31} r="2.5" fill="#3D3A45"/>
      {happy
        ? <path d="M22 40 Q30 46 38 40" stroke="#3D3A45" strokeWidth="2" fill="none" strokeLinecap="round"/>
        : <path d="M22 43 Q30 39 38 43" stroke="#3D3A45" strokeWidth="2" fill="none" strokeLinecap="round"/>
      }
      {!happy && <ellipse cx="40" cy="26" rx="3" ry="4" fill="#60A5FA" opacity="0.7"/>}
    </svg>
  );
}

function PrivacyActionCard() {
  const [active, setActive] = useState(0);
  const [os, setOs] = useState<"android"|"iphone">("android");
  const [done, setDone] = useState<Set<number>>(new Set());
  const p = PERMISSIONS[active];

  const toggleDone = (i: number) => {
    sfx.click();
    setDone(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };
  const steps = os === "android" ? p.android : p.iphone;
  const allDone = steps.every((_,i) => done.has(i));

  return (
    <BaseCard icon={ShieldAlert} iconBg="bg-[#FFE5EC]" iconColor="#E57373" title="Take Control of Your Privacy" accent="#E57373">
      <p className="text-xs text-[#6C6775] mb-4 leading-relaxed">
        You're in charge of your phone, not the apps. Tap each step as you complete it ✅
      </p>

      {/* Permission tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {PERMISSIONS.map((pm, i) => (
          <button key={pm.id} onClick={() => { setActive(i); setDone(new Set()); sfx.click(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0"
            style={{
              background: active===i ? pm.color : "#FCF9F5",
              color: active===i ? "white" : "#6C6775",
              border: `1.5px solid ${active===i ? pm.color : "#EDE7DE"}`,
            }}>
            {pm.emoji} {pm.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={p.id} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}
          transition={{ duration:0.25 }}>

          {/* Cartoon + tagline */}
          <div className="flex items-center gap-4 mb-4 p-3 rounded-2xl" style={{ background: p.light }}>
            <div className="w-20 h-20 shrink-0">{p.cartoon}</div>
            <div>
              <p className="font-bold text-sm text-[#3D3A45] mb-1">{p.emoji} {p.name} Permission</p>
              <p className="text-xs text-[#6C6775] leading-snug">{p.tagline}</p>
            </div>
          </div>

          {/* Apps using this right now */}
          <div className="rounded-2xl mb-4 overflow-hidden border border-[#EDE7DE]">
            <div className="px-3.5 py-2.5 flex items-center gap-2" style={{ background: p.color }}>
              <AlertTriangle className="h-3.5 w-3.5 text-white shrink-0"/>
              <p className="text-xs font-bold text-white">Apps likely using your {p.name} right now:</p>
            </div>
            <div className="divide-y divide-[#F5F0EB]">
              {p.culprits.map((c,i) => (
                <div key={i} className="flex items-start gap-3 px-3.5 py-2.5 bg-white">
                  <span className="text-sm font-bold text-[#3D3A45] w-24 shrink-0">{c.app}</span>
                  <span className="text-xs text-[#C62828] leading-snug">{c.risk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* OS toggle */}
          <div className="flex rounded-2xl overflow-hidden border border-[#EDE7DE] mb-3">
            {(["android","iphone"] as const).map(o => (
              <button key={o} onClick={() => { setOs(o); setDone(new Set()); sfx.click(); }}
                className="flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                style={{ background: os===o ? p.color : "white", color: os===o ? "white" : "#6C6775" }}>
                {o==="android" ? "🤖" : "🍎"} {o==="android" ? "Android" : "iPhone"}
              </button>
            ))}
          </div>

          {/* Step-by-step checklist */}
          <div className="space-y-2 mb-4">
            {steps.map((step,i) => (
              <motion.button key={i} onClick={() => toggleDone(i)}
                whileTap={{ scale:0.97 }}
                className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all"
                style={{ background: done.has(i) ? p.bg : "#FCF9F5", border: `1.5px solid ${done.has(i) ? p.color+"55" : "#EDE7DE"}` }}>
                <div className="mt-0.5 h-5 w-5 rounded-full shrink-0 flex items-center justify-center border-2 transition-all"
                  style={{ borderColor: done.has(i) ? p.color : "#C4B5FD", background: done.has(i) ? p.color : "white" }}>
                  {done.has(i) && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider mr-2"
                    style={{ color: p.color }}>Step {i+1}</span>
                  <span className="text-xs text-[#3D3A45] leading-snug">{step}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* All done celebration */}
          <AnimatePresence>
            {allDone && (
              <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background: p.bg, border:`1.5px solid ${p.color}55` }}>
                <ShieldMascot happy={true}/>
                <div>
                  <p className="font-bold text-sm" style={{ color: p.color }}>Great job! 🎉</p>
                  <p className="text-xs text-[#6C6775] leading-snug">
                    Your {p.name} permission is now locked down. Try the next permission tab to keep going!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
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
        {[PrivacyArchitectureCard, QuickWinsCard, DigitalHealthQuizCard, AppSafetyCard, AppPermissionCard, ToSCard, PrivacyActionCard, PrivacyScoreCard, EyeHealthCard, PostureCard, SleepCard, NightTimeCard, WifiSafetyCard, SaferAppsCard].map((Card,i) => (
          <motion.div key={i} variants={rise}><Card /></motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="border-t border-[#C8E6C9] py-10" style={{ background:"linear-gradient(135deg,#EAF7ED,#E8F0FE)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Big shield */}
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 72 80" className="w-14 h-14">
              <path d="M36 4 L64 16 L64 44 Q64 64 36 76 Q8 64 8 44 L8 16Z" fill="#62B685"/>
              <path d="M36 10 L58 20 L58 44 Q58 60 36 70 Q14 60 14 44 L14 20Z" fill="#86EFAC" opacity="0.4"/>
              <path d="M24 38 L32 46 L48 28" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="font-heading font-bold text-xl text-[#2E5A44] mb-1">FirstShield Privacy Guarantee</h3>
          <p className="text-sm text-[#4A7A60] mb-5 max-w-lg mx-auto">
            This app is a 100% local, read-only guide. It runs entirely inside your browser — no server, no database, no account.
          </p>
          {/* 5 seals */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {[
              { icon:"🚫", text:"No data collected" },
              { icon:"📡", text:"No network calls" },
              { icon:"🔐", text:"No permissions needed" },
              { icon:"🍪", text:"No cookies or tracking" },
              { icon:"📵", text:"Works offline" },
            ].map((s,i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/70 text-[#2E5A44] border border-[#62B685]/40">
                {s.icon} {s.text}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-[#6C6775]">
            All permission data, ToS ratings, and safety guides are hardcoded inside this app's JavaScript bundle.<br/>
            No query you make is ever transmitted — not even anonymously. Your device is the only computer involved.
          </p>
        </div>
      </div>
    </div>
  );
}
