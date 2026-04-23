"use client";

import { useState, useCallback } from "react";
import { Mic, AudioWaveform, Volume2, VolumeX, Search, MapPin, CheckCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { TRANSLATIONS } from "@/lib/translations";
import { classifyVoiceIntent, speak, stopSpeaking, schemesToSpeech, type VoiceCommand } from "@/lib/voiceCommands";

interface VoiceAssistantProps {
  onUpdate: (data: any) => void;
  currentData: any;
  lang: "en" | "hi";
  onSearch?: (query: string) => void;           // NEW: trigger search
  onNavigate?: (target: string) => void;         // NEW: trigger navigation
  onCheckEligibility?: () => void;               // NEW: trigger eligibility
  currentResults?: any[];                        // NEW: results for TTS
}

export default function VoiceAssistant({ 
  onUpdate, currentData, lang, 
  onSearch, onNavigate, onCheckEligibility, currentResults 
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const t = TRANSLATIONS[lang]?.vaani || TRANSLATIONS["en"].vaani;

  // --- Voice Command Handler ---
  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    setLastCommand(command);
    
    switch (command.intent) {
      case 'SEARCH':
        if (onSearch && command.entities.searchQuery) {
          onSearch(command.entities.searchQuery);
          toast.success(
            lang === 'hi' ? '🔍 खोज रहे हैं...' : '🔍 Searching...', 
            { description: command.entities.searchQuery }
          );
          if (ttsEnabled) speak(
            lang === 'hi' ? `"${command.entities.searchQuery}" खोज रहे हैं` : `Searching for "${command.entities.searchQuery}"`, 
            lang
          );
        }
        return true;

      case 'NAVIGATE':
        if (onNavigate && command.entities.target) {
          onNavigate(`/${command.entities.target}`);
          toast.success(
            lang === 'hi' ? '📍 नेविगेट कर रहे हैं' : '📍 Navigating...', 
            { description: command.entities.target }
          );
          if (ttsEnabled) speak(
            lang === 'hi' ? `${command.entities.target} पर जा रहे हैं` : `Going to ${command.entities.target}`, 
            lang
          );
        }
        return true;

      case 'ELIGIBILITY':
        if (onCheckEligibility) {
          onCheckEligibility();
          toast.success(lang === 'hi' ? '✅ पात्रता जांच' : '✅ Checking eligibility');
          if (ttsEnabled) speak(
            lang === 'hi' ? 'आपकी पात्रता जांच रहे हैं' : 'Checking your eligibility now', 
            lang
          );
        }
        return true;

      case 'READ':
        if (currentResults && currentResults.length > 0) {
          const speechText = schemesToSpeech(currentResults, lang);
          speak(speechText, lang);
          toast.success(lang === 'hi' ? '🔊 पढ़ रहे हैं' : '🔊 Reading results');
        } else {
          const noResults = lang === 'hi' ? 'कोई परिणाम नहीं है। पहले पात्रता जांचें।' : 'No results to read. Check eligibility first.';
          speak(noResults, lang);
          toast.info(noResults);
        }
        return true;

      case 'FORM_FILL':
      default:
        return false; // Falls through to existing form-fill logic
    }
  }, [onSearch, onNavigate, onCheckEligibility, currentResults, lang, ttsEnabled]);

  const startListening = () => {
    if (typeof window === "undefined" || !('webkitSpeechRecognition' in window)) {
      toast.error("Browser not supported", { description: "Try Chrome or Edge." });
      return;
    }

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript(t.listening);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(`"${text}"`);
      setIsListening(false);
      
      // NEW: First try voice command classification
      const command = classifyVoiceIntent(text, lang);
      const wasHandled = handleVoiceCommand(command);
      
      // If not a navigation/search command, fall through to form filling
      if (!wasHandled) {
        processVoiceInput(text);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
      setTranscript(t.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Existing form-fill logic (preserved) ---
  const processVoiceInput = (text: string) => {
    const cleanText = " " + text.replace(/[,₹Rs\-.]/g, "").toLowerCase() + " ";
    let updates: any = {};
    
    console.log("🎤 Processing:", cleanText);

    const contains = (patterns: string[]) => {
      return patterns.some(p => {
        const regex = new RegExp(`(?:^|\\s)(${p})(?:\\s|$)`, 'i');
        return regex.test(cleanText);
      });
    };

    // --- A. INCOME DETECTION ---
    const incomeKeywords = ["income", "salary", "aay", "vetan", "kamata", "kama", "kamai", "rupay", "rupaye", "paisa", "paise", "money", "आय", "वेतन", "कमाई", "रुपये", "रुपए", "सैलरी", "इनकम", "पैसा"];
    
    if (incomeKeywords.some(k => cleanText.includes(k))) {
      let incomeFound = false;
      
      const lakhMatch = cleanText.match(/(\d+(\.\d+)?)\s*(lakh|laakh|lak|lkh|lac|lt|लाख|लख|लक)/);
      const thousandMatch = cleanText.match(/(\d+(\.\d+)?)\s*(k|thousand|hazar|hazaar|hajar|हजार|हज़ार)/);

      if (lakhMatch) {
        updates.income = (parseFloat(lakhMatch[1]) * 100000).toString();
        incomeFound = true;
      } 
      else if (thousandMatch) {
        updates.income = (parseFloat(thousandMatch[1]) * 1000).toString();
        incomeFound = true;
      }

      if (!incomeFound) {
        const allNumbers = cleanText.match(/\d+(\.\d+)?/g);
        if (allNumbers) {
          const numericValues = allNumbers.map(n => parseFloat(n));
          const maxVal = Math.max(...numericValues);
          if (maxVal > 500) updates.income = maxVal.toString();
        }
      }
    }
    
    // --- B. AGE DETECTION ---
    const ageKeywords = ["age", "old", "year", "years", "umar", "saal", "ayu", "varsh", "baras", "janm", "उम्र", "आयु", "साल", "वर्ष", "बरस", "एज"];
    
    if (ageKeywords.some(k => cleanText.includes(k))) {
       const allNumbers = cleanText.match(/\d+/g);
       if (allNumbers) {
         const validAge = allNumbers.find(n => {
            const num = parseInt(n);
            const isNotIncome = updates.income ? (parseFloat(updates.income) !== num && parseFloat(updates.income) !== num * 100000) : true;
            return num > 10 && num < 110 && isNotIncome;
         });
         if (validAge) updates.age = validAge;
       }
    }

    // --- C. CASTE / CATEGORY ---
    if (contains([
      "sc", "s c", "es si", "ac", "a c", "schedule caste", "anusuchit jati", "dalit", "harijan", 
      "एस सी", "एसी", "ए सी", "अनुसूचित जाति", "दलित", "हरिजन"
    ])) {
      updates.caste = "SC";
    }
    else if (contains([
      "st", "s t", "es ti", "schedule tribe", "anusuchit janjati", "adivasi", "tribal", "vanvasi",
      "एस टी", "एसटी", "अनुसूचित जनजाति", "आदिवासी", "वनवासी"
    ])) {
      updates.caste = "ST";
    }
    else if (contains([
      "obc", "o b c", "other backward", "backward", "pichda", "pichdi", "pichhada",
      "ओबीसी", "ओ बी सी", "पिछड़ा", "पिछड़ी", "अन्य पिछड़ा"
    ])) {
      updates.caste = "OBC";
    }
    else if (contains([
      "general", "gen", "samanya", "savarn", "brahmin", "kshatriya", "upper caste", "unreserved", "open",
      "सामान्य", "सवर्ण", "जनरल", "ब्राह्मण", "क्षत्रिय", "अनारक्षित", "ओपन"
    ])) {
      updates.caste = "General";
    }

    // --- D. OCCUPATION ---
    if (contains([
      "farmer", "farming", "kisan", "krishi", "kheti", "mazdoor", "majdoor", "agriculture", "cultivator", "hal",
      "किसान", "कृषि", "खेती", "मजदूर", "हल", "खेतिहर"
    ])) {
      updates.occupation = "Farmer";
    }
    else if (contains([
      "student", "studying", "study", "chatra", "vidyarthi", "padhai", "school", "college", "university", "exam", "preparation", "coaching",
      "छात्र", "छात्रा", "विद्यार्थी", "पढ़ाई", "स्कूल", "कॉलेज", "यूनिवर्सिटी", "तैयारी", "कोचिंग"
    ])) {
      updates.occupation = "Student";
    }
    else if (contains([
      "business", "businessman", "vyapar", "shop", "shopkeeper", "dukan", "dhandha", "merchant", "trade", "self employed", "owner",
      "बिज़नेस", "व्यापार", "दुकान", "दुकानदार", "धंधा", "सेल्फ एंप्लॉयड", "मालिक"
    ])) {
      updates.occupation = "Business";
    }
    else if (contains([
      "unemployed", "berojgar", "jobless", "housewife", "grahini", "homemaker", "nothing", "bekar", "no job", "search job",
      "बेरोजगार", "गृहिणी", "कुछ नहीं", "बेकार", "नौकरी नहीं", "घर"
    ])) {
      updates.occupation = "Unemployed";
    }

    // --- E. GENDER ---
    if (contains([
      "female", "woman", "girl", "aurat", "mahila", "ladki", "stri", "lady", "madam", "behan", "mata", "wife",
      "महिला", "औरत", "लड़की", "स्त्री", "मैडम", "बहन", "माता", "पत्नी", "छात्रा", "गृहिणी"
    ])) {
      updates.gender = "Female";
    } 
    else if (contains([
      "male", "man", "boy", "aadmi", "purush", "ladka", "gent", "sir", "bhai", "pita", "husband",
      "आदमी", "पुरुष", "लड़का", "सर", "भाई", "पिता", "पति", "छात्र"
    ])) {
      updates.gender = "Male";
    }
    else if (contains(["other", "others", "trans", "transgender", "kinnar", "anya", "किन्नर", "अन्य", "ट्रांसजेंडर"])) {
      updates.gender = "Other";
    }
    else if (cleanText.match(/(ka|tha|raha|hoon)\b|का|था|रहा|हूं/)) {
       if (cleanText.match(/ki|thi|rahi|ti|की|थी|रही|ती/)) updates.gender = "Female";
       else updates.gender = "Male";
    }

    // --- APPLY UPDATES ---
    if (Object.keys(updates).length > 0) {
      onUpdate({ ...currentData, ...updates });
      
      let details = [];
      if(updates.income) details.push(`Income: ${updates.income}`);
      if(updates.age) details.push(`Age: ${updates.age}`);
      if(updates.caste) details.push(`Caste: ${updates.caste}`);
      if(updates.occupation) details.push(`Job: ${updates.occupation}`);
      if(updates.gender) details.push(`Gender: ${updates.gender}`);
      
      const successMsg = details.join(" | ");
      toast.success(t.success, { description: successMsg });
      
      // TTS confirmation
      if (ttsEnabled) {
        speak(
          lang === 'hi' ? `${successMsg} अपडेट किया गया` : `Updated: ${successMsg}`, 
          lang
        );
      }
    } else {
      toast.info(t.processing, { 
        description: `Heard: "${text}". Try adding more details.` 
      });
    }
  };

  // --- Intent Badge ---
  const getIntentBadge = () => {
    if (!lastCommand) return null;
    
    const badges: Record<string, { icon: any; label: string; color: string }> = {
      SEARCH: { icon: <Search size={10} />, label: 'Search', color: 'bg-indigo-100 text-indigo-700' },
      NAVIGATE: { icon: <MapPin size={10} />, label: 'Navigate', color: 'bg-cyan-100 text-cyan-700' },
      ELIGIBILITY: { icon: <CheckCircle size={10} />, label: 'Eligibility', color: 'bg-emerald-100 text-emerald-700' },
      READ: { icon: <BookOpen size={10} />, label: 'Read Aloud', color: 'bg-purple-100 text-purple-700' },
      FORM_FILL: { icon: <Mic size={10} />, label: 'Form Fill', color: 'bg-orange-100 text-orange-700' },
    };
    
    const badge = badges[lastCommand.intent] || badges.FORM_FILL;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.color}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  return (
    <div 
      className="relative overflow-hidden bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 group hover:border-orange-200 transition-all"
      role="region"
      aria-label={lang === 'hi' ? 'वाणी - आवाज़ सहायक' : 'Vaani - Voice Assistant'}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-orange-100 p-2 rounded-lg text-orange-600" aria-hidden="true"><Mic size={20} /></span>
            {t.title}
          </h3>
          <p className="text-xs text-slate-400 font-medium ml-1 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* TTS Toggle */}
          <button 
            onClick={() => { setTtsEnabled(!ttsEnabled); if (!ttsEnabled) stopSpeaking(); }}
            className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
            title={ttsEnabled ? 'TTS On' : 'TTS Off'}
          >
            {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100">
            <div className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${lang === "en" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 opacity-50"}`}>EN</div>
            <div className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${lang === "hi" ? "bg-orange-500 text-white shadow-sm" : "text-slate-400 opacity-50"}`}>हिंदी</div>
          </div>
        </div>
      </div>
      
      {/* Waveform Display */}
      <div 
        className="relative h-32 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center overflow-hidden mb-4"
        role="status"
        aria-live="polite"
      >
        {isListening ? (
          <div className="flex items-center gap-1.5 h-12" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 bg-orange-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <AudioWaveform size={32} className="opacity-20" aria-hidden="true" />
            <span className="text-xs font-medium">{t.tapToSpeak}</span>
          </div>
        )}
      </div>
      
      {/* Transcript + Intent Badge */}
      <div className="min-h-[20px] mb-4 text-center space-y-1">
        <p className="text-xs font-medium text-slate-500 truncate px-4" aria-live="polite">
          {transcript || (lang === "hi" ? "उदाहरण: 'किसानों के लिए योजनाएं दिखाओ'" : "Try: 'Show schemes for farmers'")}
        </p>
        {lastCommand && (
          <div className="flex justify-center">{getIntentBadge()}</div>
        )}
      </div>
      
      {/* Voice Commands Guide */}
      <div className="mb-4 px-2">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { cmd: lang === 'hi' ? '"योजनाएं खोजो"' : '"Find schemes"', icon: '🔍' },
            { cmd: lang === 'hi' ? '"पात्रता जांचो"' : '"Check eligibility"', icon: '✅' },
            { cmd: lang === 'hi' ? '"केंद्र खोलो"' : '"Go to Kendra map"', icon: '📍' },
            { cmd: lang === 'hi' ? '"नतीजे पढ़ो"' : '"Read results"', icon: '🔊' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-lg px-2 py-1.5 text-[9px] text-slate-500 font-medium flex items-center gap-1">
              <span aria-hidden="true">{item.icon}</span> {item.cmd}
            </div>
          ))}
        </div>
      </div>
      
      {/* Record Button */}
      <button 
        onClick={startListening} 
        disabled={isListening} 
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2 ${isListening ? "bg-rose-500 text-white shadow-rose-500/30 scale-95" : "bg-slate-900 text-white shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98]"}`}
        aria-label={isListening ? 'Listening for voice input' : 'Start voice recording'}
      >
        {isListening ? <>Listening...</> : <><Mic size={16} /> {lang === 'hi' ? 'शुरू करें' : 'Start Recording'}</>}
      </button>
    </div>
  );
}