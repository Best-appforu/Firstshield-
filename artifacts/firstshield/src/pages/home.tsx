import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Smartphone, Gauge, FileText, Eye, User, Moon, Wifi, ShieldAlert,
  CheckCircle2, AlertTriangle, ArrowRight, Play, Pause, RotateCcw
} from "lucide-react";
import { SiWhatsapp, SiSignal, SiGooglechrome, SiBrave, SiDuckduckgo, SiGoogle, SiGmail, SiProtonmail, SiGooglemaps, SiTiktok, SiYoutube, SiApple, SiAndroid } from "react-icons/si";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden text-text-dark font-sans selection:bg-pastel-purple selection:text-icon-purple">
      
      {/* Headphone Alert Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md text-center p-8 rounded-3xl border-0 shadow-2xl">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-pastel-purple rounded-full flex items-center justify-center">
              <Wifi className="h-10 w-10 text-icon-purple" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading mb-2">Wireless Audio Alert!</DialogTitle>
            <DialogDescription className="text-base text-text-muted">
              Do you use Bluetooth headphones? Turn Bluetooth OFF when not in use to prevent unauthorized connections.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6">
            <Button onClick={() => setShowModal(false)} className="rounded-full px-8 py-6 bg-text-dark hover:bg-black text-white font-bold text-lg w-full">
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-16 relative">
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-pastel-pink to-pastel-purple blur-2xl opacity-60 rounded-full w-24 h-24"></div>
            <div className="h-24 w-24 bg-gradient-to-tr from-[#FFE5EC] to-[#F3E8FF] rounded-[2rem] flex items-center justify-center relative shadow-lg border border-white rotate-3">
              <Shield className="h-12 w-12 text-icon-purple" />
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-text-dark mb-4 tracking-tight">FirstShield</h1>
          <p className="text-lg md:text-xl text-text-muted font-medium max-w-2xl text-balance">
            Your digital safety companion. Installed first, trusted always.
          </p>
        </div>

        {/* Masonry Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
        >
          {/* Card 1: App Safety Advisor */}
          <motion.div variants={itemVariants}>
            <AppSafetyCard />
          </motion.div>

          {/* Card 2: Privacy Score Calculator */}
          <motion.div variants={itemVariants}>
            <PrivacyScoreCard />
          </motion.div>

          {/* Card 3: Terms & Conditions */}
          <motion.div variants={itemVariants}>
            <TermsCard />
          </motion.div>

          {/* Card 4: Eye Health Guard */}
          <motion.div variants={itemVariants}>
            <EyeHealthCard />
          </motion.div>

          {/* Card 5: Phone Posture */}
          <motion.div variants={itemVariants}>
            <PostureCard />
          </motion.div>

          {/* Card 6: Protect Your Sleep */}
          <motion.div variants={itemVariants}>
            <SleepCard />
          </motion.div>

          {/* Card 7: Wi-Fi Safety */}
          <motion.div variants={itemVariants}>
            <WifiSafetyCard />
          </motion.div>

          {/* Card 8: Safer App Alternatives */}
          <motion.div variants={itemVariants}>
            <SaferAppsCard />
          </motion.div>

        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-pastel-mint py-8 border-t border-[#D1E7DD]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold text-[#2E5A44] flex items-center justify-center gap-2">
            <Shield className="h-5 w-5" /> 100% Privacy Guarantee: This app collects zero data. No permissions required. Your safety is our only goal.
          </p>
        </div>
      </div>

    </div>
  );
}


// --- Cards ---

function BaseCard({ children, icon: Icon, iconBg, iconColor, title, className = "" }: any) {
  return (
    <div className={`bg-white rounded-3xl p-6 shadow-sm border border-[#EDE7DE] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-4 mb-5">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${iconBg} text-${iconColor}`}>
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
        <h2 className="text-xl font-heading font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// 1. App Safety Advisor
function AppSafetyCard() {
  const [tab, setTab] = useState("google");

  return (
    <BaseCard icon={Smartphone} iconBg="bg-pastel-purple" iconColor="var(--color-icon-purple)" title="App Safety Advisor">
      <div className="flex bg-cream p-1 rounded-full mb-4">
        {["google", "instagram", "loans"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-sm py-2 px-3 rounded-full font-bold transition-all ${tab === t ? "bg-white text-text-dark shadow-sm" : "text-text-muted hover:text-text-dark"}`}
          >
            {t === "google" ? "Google/YT" : t === "instagram" ? "Instagram" : "Loan Apps"}
          </button>
        ))}
      </div>
      
      <div className="space-y-3 relative min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 space-y-3"
          >
            {tab === "google" && (
              <>
                <FlagBox type="green" title="Green Flags">
                  <li>Auto-delete activity history option</li>
                  <li>Two-step verification available</li>
                  <li>Incognito mode on YouTube</li>
                </FlagBox>
                <FlagBox type="red" title="Red Flags">
                  <li>Location always tracked</li>
                  <li>Searches monitored for targeted ads</li>
                  <li>Voice history stored</li>
                </FlagBox>
              </>
            )}
            {tab === "instagram" && (
              <>
                <FlagBox type="green" title="Green Flags">
                  <li>Account privacy setting easy to enable</li>
                  <li>Synced contacts can be removed</li>
                  <li>Two-factor auth available</li>
                </FlagBox>
                <FlagBox type="red" title="Red Flags">
                  <li>Cross-shares data with Facebook</li>
                  <li>Gallery permission scans all photos</li>
                  <li>Activity tracked across apps</li>
                </FlagBox>
              </>
            )}
            {tab === "loans" && (
              <>
                <FlagBox type="green" title="Green Flags">
                  <li>RBI / banking license visible</li>
                  <li>Transparent interest rates and repayment terms</li>
                  <li>Customer support number clearly listed</li>
                </FlagBox>
                <FlagBox type="red" title="Red Flags">
                  <li>Requests contacts & personal photos</li>
                  <li>Threatening customer care tactics</li>
                  <li>Hidden charges in fine print</li>
                </FlagBox>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </BaseCard>
  );
}

function FlagBox({ type, title, children }: any) {
  const isGreen = type === "green";
  return (
    <div className={`p-4 rounded-2xl ${isGreen ? "bg-pastel-mint/50" : "bg-pastel-pink/50"}`}>
      <h4 className={`text-sm font-bold flex items-center gap-2 mb-2 ${isGreen ? "text-[#3A7D54]" : "text-[#C94A4A]"}`}>
        {isGreen ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {title}
      </h4>
      <ul className="text-sm space-y-1 pl-6 list-disc marker:text-current opacity-80">
        {children}
      </ul>
    </div>
  );
}

// 2. Privacy Score Calculator
function PrivacyScoreCard() {
  const [perms, setPerms] = useState({ loc: false, contacts: false, sms: false, cam: false });
  const score = 100 - (perms.loc ? 25 : 0) - (perms.contacts ? 25 : 0) - (perms.sms ? 25 : 0) - (perms.cam ? 25 : 0);

  let status, colorClass;
  if (score === 100) { status = "Safe! No major concerns."; colorClass = "bg-pastel-blue text-[#2B5D95]"; }
  else if (score === 75) { status = "Caution: Privacy slightly compromised."; colorClass = "bg-pastel-yellow text-[#957A1E]"; }
  else if (score === 50) { status = "Risk! Multiple sensitive permissions granted."; colorClass = "bg-pastel-pink text-[#C94A4A]"; }
  else { status = "Danger! High risk of data leakage."; colorClass = "bg-[#FFE5EC] text-[#C94A4A] border border-accent-red"; }

  return (
    <BaseCard icon={Gauge} iconBg="bg-pastel-pink" iconColor="var(--color-icon-pink)" title="Privacy Score">
      <p className="text-sm text-text-muted mb-4 font-medium">Select the permissions an app is requesting:</p>
      
      <div className="space-y-2 mb-6">
        {[
          { id: 'loc', label: 'Location', desc: 'Tracks where you are at all times' },
          { id: 'contacts', label: 'Contacts', desc: "Can leak your friends' phone numbers" },
          { id: 'sms', label: 'SMS', desc: 'Reads your OTPs and personal messages' },
          { id: 'cam', label: 'Camera', desc: 'May capture photos/video without you knowing' }
        ].map((item) => (
          <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-[#EDE7DE] cursor-pointer hover:bg-cream transition-colors group">
            <input 
              type="checkbox" 
              checked={perms[item.id as keyof typeof perms]}
              onChange={(e) => setPerms({...perms, [item.id]: e.target.checked})}
              className="mt-1 h-5 w-5 rounded text-icon-purple focus:ring-icon-purple border-gray-300 transition-all cursor-pointer" 
            />
            <div>
              <div className="font-bold text-sm group-hover:text-icon-purple transition-colors">{item.label}</div>
              <div className="text-xs text-text-muted">{item.desc}</div>
            </div>
          </label>
        ))}
      </div>

      <motion.div 
        layout
        className={`p-4 rounded-2xl text-center transition-colors duration-500 ${colorClass}`}
      >
        <motion.div 
          key={score}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-heading font-bold mb-1"
        >
          {score}%
        </motion.div>
        <div className="text-sm font-bold">{status}</div>
      </motion.div>
    </BaseCard>
  );
}

// 3. Terms & Conditions Cheat Sheet
function TermsCard() {
  return (
    <BaseCard icon={FileText} iconBg="bg-pastel-yellow" iconColor="#D4A373" title="Don't sign without reading!">
      <div className="space-y-3">
        {[
          { title: "Google: Data Collection", desc: "Your watched videos, searches, and voice recordings are permanently stored to build your profile." },
          { title: "Instagram: Image Ownership", desc: "Instagram gets a royalty-free license to use any photo you post for their commercial purposes." },
          { title: "Hidden Clauses", desc: "Most free apps reserve the right to change their terms at any time without notifying you." }
        ].map((trap, i) => (
          <div key={i} className="border-l-4 border-accent-red bg-pastel-pink/30 p-4 rounded-r-2xl">
            <h4 className="font-bold text-[#C94A4A] text-sm mb-1">{trap.title}</h4>
            <p className="text-sm text-text-dark leading-relaxed opacity-90">{trap.desc}</p>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

// 4. Eye Health Guard
function EyeHealthCard() {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 mins
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"work" | "rest">("work");

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (phase === "work") {
        setPhase("rest");
        setTimeLeft(20);
        toast({ title: "Rest your eyes!", description: "Look 20 feet away for 20 seconds.", duration: 4000 });
      } else {
        setPhase("work");
        setTimeLeft(20 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase, toast]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setPhase("work"); setTimeLeft(20 * 60); };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = phase === "work" ? 20 * 60 : 20;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const ringColor = phase === "work" ? "var(--color-icon-blue)" : "var(--color-icon-mint)";

  return (
    <BaseCard icon={Eye} iconBg="bg-pastel-mint" iconColor="var(--color-icon-mint)" title="Eye Health Guard (20-20-20 Rule)">
      <div className="bg-pastel-yellow p-3 rounded-xl text-sm mb-6 leading-relaxed border border-[#F0E4BE]">
        <span className="font-bold">Every 20 minutes of screen time</span> → Look 20 feet away for 20 seconds. This prevents digital eye strain.
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#EDE7DE" strokeWidth="8" />
            <motion.circle 
              cx="50" cy="50" r="45" fill="none" stroke={ringColor} strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xs font-bold tracking-widest ${phase === "work" ? "text-icon-blue" : "text-icon-mint"}`}>
              {phase.toUpperCase()}
            </span>
            <span className={`text-3xl font-heading font-bold ${phase === "rest" ? "animate-pulse text-icon-mint" : "text-text-dark"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button onClick={toggleTimer} className="rounded-full px-6 bg-text-dark hover:bg-black text-white">
            {isActive ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Start</>}
          </Button>
          <Button variant="outline" onClick={resetTimer} className="rounded-full px-4 border-[#EDE7DE]">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {[
          { emoji: "👁", title: "Blurry vision", tip: "Blink more often — 15x/min minimum" },
          { emoji: "😴", title: "Eye fatigue", tip: "Use lubricating eye drops" },
          { emoji: "🤕", title: "Headache", tip: "Reduce screen brightness" },
          { emoji: "😢", title: "Dry eyes", tip: "Use the 20-20-20 rule consistently" },
        ].map((s, i) => (
          <div key={i} className="bg-cream p-3 rounded-xl border border-[#EDE7DE]">
            <div className="text-xs font-bold mb-1">{s.emoji} {s.title}</div>
            <div className="text-xs text-text-muted leading-tight">{s.tip}</div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

// 5. Posture Card
function PostureCard() {
  const data = [
    { name: "0°", weight: 12, fill: "#62B685" },
    { name: "15°", weight: 27, fill: "#A3C973" },
    { name: "30°", weight: 40, fill: "#D4A373" },
    { name: "45°", weight: 49, fill: "#E58F73" },
    { name: "60°", weight: 60, fill: "#E57373" },
  ];

  return (
    <BaseCard icon={User} iconBg="bg-pastel-blue" iconColor="var(--color-icon-blue)" title="Protect Your Neck (Text Neck)">
      <div className="h-[200px] w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
            <Tooltip cursor={{ fill: 'transparent' }} content={({ payload }) => {
              if (payload && payload.length) {
                return <div className="bg-text-dark text-white text-xs px-2 py-1 rounded shadow-lg">{payload[0].value} lbs load</div>;
              }
              return null;
            }} />
            <Bar dataKey="weight" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-center text-xs text-text-muted mt-2 font-medium">Head tilt angle vs. effective weight on neck</p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold mb-2">Posture Tips:</h4>
        <ul className="text-sm space-y-2">
          <li className="flex items-start gap-2"><span className="opacity-70">📱</span> Hold phone at eye level, not in your lap</li>
          <li className="flex items-start gap-2"><span className="opacity-70">🪑</span> Sit with your back straight and shoulders relaxed</li>
          <li className="flex items-start gap-2"><span className="opacity-70">⏱</span> Take posture breaks every 30 minutes</li>
          <li className="flex items-start gap-2"><span className="opacity-70">💪</span> Do neck stretches: tilt head side to side, 5 reps each</li>
        </ul>
      </div>
    </BaseCard>
  );
}

// 6. Sleep Card
function SleepCard() {
  return (
    <BaseCard icon={Moon} iconBg="bg-pastel-purple" iconColor="var(--color-icon-purple)" title="Protect Your Sleep">
      <div className="flex items-center justify-between bg-cream p-4 rounded-2xl mb-6">
        <div className="text-center"><div className="w-12 h-12 bg-pastel-blue rounded-xl mx-auto flex items-center justify-center mb-1 text-icon-blue font-bold text-xs">Blue Light</div></div>
        <ArrowRight className="text-[#E58F73] h-5 w-5" />
        <div className="text-center"><div className="w-12 h-12 bg-[#FFE5EC] rounded-xl mx-auto flex items-center justify-center mb-1 text-[#E58F73] font-bold text-[10px] leading-tight p-1">Suppresses Melatonin</div></div>
        <ArrowRight className="text-icon-purple h-5 w-5" />
        <div className="text-center"><div className="w-12 h-12 bg-pastel-purple rounded-xl mx-auto flex items-center justify-center mb-1 text-icon-purple font-bold text-[10px] leading-tight p-1">Delays Sleep</div></div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-cream p-4 rounded-2xl border border-[#EDE7DE]">
          <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><SiApple className="h-4 w-4 text-gray-800" /> iOS Bedtime Setup</h4>
          <ol className="text-xs space-y-1 list-decimal list-inside opacity-80 pl-1">
            <li>Settings → Display & Brightness → Night Shift</li>
            <li>Schedule: Sunset to Sunrise</li>
            <li>Color warmth: drag to "More Warm"</li>
          </ol>
        </div>
        <div className="bg-cream p-4 rounded-2xl border border-[#EDE7DE]">
          <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><SiAndroid className="h-4 w-4 text-[#3DDC84]" /> Android Bedtime Setup</h4>
          <ol className="text-xs space-y-1 list-decimal list-inside opacity-80 pl-1">
            <li>Settings → Display → Eye Comfort Shield</li>
            <li>Toggle ON, set schedule</li>
            <li>Adjust color temperature</li>
          </ol>
        </div>
      </div>

      <div className="bg-pastel-mint p-4 rounded-2xl text-sm text-[#2E5A44] leading-relaxed">
        <span className="font-bold">Stop using your phone 1 hour before bed.</span> Even with Night Shift on, the mental stimulation delays sleep onset.
      </div>
    </BaseCard>
  );
}

// 7. Wi-Fi Safety
function WifiSafetyCard() {
  return (
    <BaseCard icon={Wifi} iconBg="bg-pastel-mint" iconColor="var(--color-icon-mint)" title="Wi-Fi Safety: Myths vs. Facts">
      <div className="bg-pastel-mint p-4 rounded-2xl text-sm text-[#2E5A44] mb-6 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
        <p><strong>Wi-Fi radiation is safe (non-ionizing).</strong> WHO-classified as harmless at normal exposure levels. No proven health risk.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[
          { myth: "Wi-Fi causes cancer", fact: "Non-ionizing radiation cannot damage DNA" },
          { myth: "Router should be far from bedroom", fact: "Signal strength drops with distance but is still safe" },
          { myth: "5G is dangerous", fact: "5G uses radio waves, same physics as 4G, tested safe" },
          { myth: "Airplane mode cures everything", fact: "Only needed for actual airplane regulations" }
        ].map((item, i) => (
          <div key={i} className="bg-cream p-3 rounded-xl border border-[#EDE7DE] text-xs">
            <div className="text-[#C94A4A] font-bold mb-1">🔴 Myth: {item.myth}</div>
            <div className="text-[#3A7D54]">🟢 Fact: {item.fact}</div>
          </div>
        ))}
      </div>

      <h4 className="text-sm font-bold mb-3">Practical Safety Tips:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          "Use VPN on public Wi-Fi",
          "Avoid banking on open networks",
          "Keep Bluetooth OFF when not in use",
          "Headphone volume max 60% — 60 min limit",
          "Don't sleep with phone under pillow",
          "Check if network is password-protected"
        ].map((tip, i) => (
          <div key={i} className="flex gap-2 items-start text-xs bg-pastel-mint/30 p-2 rounded-lg">
            <span className="font-bold text-icon-mint">{i+1}.</span> <span className="opacity-90">{tip}</span>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

// 8. Safer App Alternatives
function SaferAppsCard() {
  const alts = [
    { bad: "WhatsApp", badIcon: SiWhatsapp, badColor: "#25D366", good: "Signal", goodIcon: SiSignal, goodColor: "#3A76F0", why: "End-to-end encrypted, no ads, no data sharing" },
    { bad: "Chrome", badIcon: SiGooglechrome, badColor: "#4285F4", good: "Brave", goodIcon: SiBrave, goodColor: "#FF3E00", why: "Blocks trackers by default" },
    { bad: "Google Search", badIcon: SiGoogle, badColor: "#4285F4", good: "DuckDuckGo", goodIcon: SiDuckduckgo, goodColor: "#DE5833", why: "No search history stored" },
    { bad: "Gmail", badIcon: SiGmail, badColor: "#EA4335", good: "ProtonMail", goodIcon: SiProtonmail, goodColor: "#6D4AFF", why: "End-to-end encrypted email" },
    { bad: "Google Maps", badIcon: SiGooglemaps, badColor: "#34A853", good: "OsmAnd", goodIcon: ShieldAlert, goodColor: "#80C342", why: "Open-source, works offline" },
    { bad: "TikTok", badIcon: SiTiktok, badColor: "#000000", good: "YouTube", goodIcon: SiYoutube, goodColor: "#FF0000", why: "Better privacy controls" }
  ];

  return (
    <BaseCard icon={ShieldAlert} iconBg="bg-pastel-yellow" iconColor="#E58F73" title="Safer App Alternatives">
      <p className="text-sm text-text-muted mb-4 font-medium">Privacy-first replacements for popular apps</p>
      <div className="space-y-3">
        {alts.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-cream border border-[#EDE7DE] group hover:bg-white transition-colors relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#E58F73] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 w-full sm:w-2/5">
                <item.badIcon className="text-lg opacity-70" style={{ color: item.badColor }} />
                <span className="text-sm text-text-muted line-through decoration-text-muted/50">{item.bad}</span>
              </div>
              <ArrowRight className="hidden sm:block h-4 w-4 text-text-muted shrink-0" />
              <div className="flex items-center gap-2 w-full sm:w-3/5">
                <item.goodIcon className="text-xl" style={{ color: item.goodColor }} />
                <div>
                  <div className="text-sm font-bold text-text-dark">{item.good}</div>
                  <div className="text-[10px] leading-tight text-text-muted">{item.why}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}
