/**
 * Voice Command System — Intent Classification + TTS
 * 
 * Classifies spoken input into actionable intents:
 * - SEARCH: "show schemes for farmers" → triggers search
 * - NAVIGATE: "go to kendra map" → navigates to page
 * - ELIGIBILITY: "check my eligibility" → triggers form submission
 * - READ: "read results" → TTS speaks current results
 * - FORM_FILL: "I am a 25 year old farmer" → fills form (existing behavior)
 */

// --- Types ---
export interface VoiceCommand {
  intent: 'SEARCH' | 'NAVIGATE' | 'ELIGIBILITY' | 'READ' | 'FORM_FILL' | 'UNKNOWN';
  entities: Record<string, string>;
  confidence: number;
  originalText: string;
}

export type NavigationTarget = 'kendra' | 'community' | 'tracker' | 'vault' | 'graph' | 'home';

// --- Intent Patterns ---

interface IntentPattern {
  intent: VoiceCommand['intent'];
  patterns_en: RegExp[];
  patterns_hi: RegExp[];
  entityExtractor?: (text: string, lang: 'en' | 'hi') => Record<string, string>;
}

const INTENT_PATTERNS: IntentPattern[] = [
  // SEARCH: "show schemes for farmers", "find scholarship for students"
  {
    intent: 'SEARCH',
    patterns_en: [
      /(?:show|find|search|look\s*up|get)\s+(?:me\s+)?(?:schemes?|yojana|benefits?)\s+(?:for|about|related\s+to)\s+(.+)/i,
      /(?:schemes?|yojana)\s+(?:for|about)\s+(.+)/i,
      /(?:what|which)\s+(?:schemes?|yojana|benefits?)\s+(?:for|are\s+available\s+for)\s+(.+)/i,
      /(?:search|find|look)\s+(?:for\s+)?(.+?)(?:\s+schemes?|\s+yojana)?$/i,
    ],
    patterns_hi: [
      /(?:दिखाओ|खोजो|ढूंढो|बताओ)\s+(.+?)\s+(?:के लिए|की|का)\s*(?:योजना|स्कीम)/i,
      /(.+?)\s+(?:के लिए|की|का)\s*(?:योजना|स्कीम)\s*(?:दिखाओ|बताओ|खोजो)/i,
      /(?:योजना|स्कीम)\s+(?:दिखाओ|ढूंढो)\s+(.+)/i,
    ],
    entityExtractor: (text: string, lang: 'en' | 'hi') => {
      // Extract the search query from the matched pattern
      for (const pattern of INTENT_PATTERNS[0].patterns_en) {
        const match = text.match(pattern);
        if (match && match[1]) return { searchQuery: match[1].trim() };
      }
      for (const pattern of INTENT_PATTERNS[0].patterns_hi) {
        const match = text.match(pattern);
        if (match && match[1]) return { searchQuery: match[1].trim() };
      }
      return { searchQuery: text };
    },
  },
  
  // NAVIGATE: "go to kendra map", "open community", "take me to tracker"
  {
    intent: 'NAVIGATE',
    patterns_en: [
      /(?:go\s+to|open|navigate\s+to|take\s+me\s+to|show\s+me)\s+(kendra|map|community|forum|tracker|vault|graph|home|dashboard)/i,
    ],
    patterns_hi: [
      /(?:जाओ|खोलो|दिखाओ)\s+(केंद्र|नक्शा|समुदाय|मंच|ट्रैकर|वॉल्ट|ग्राफ|होम)/i,
    ],
    entityExtractor: (text: string) => {
      const targetMap: Record<string, NavigationTarget> = {
        'kendra': 'kendra', 'map': 'kendra', 'केंद्र': 'kendra', 'नक्शा': 'kendra',
        'community': 'community', 'forum': 'community', 'समुदाय': 'community', 'मंच': 'community',
        'tracker': 'tracker', 'ट्रैकर': 'tracker',
        'vault': 'vault', 'वॉल्ट': 'vault',
        'graph': 'graph', 'ग्राफ': 'graph',
        'home': 'home', 'dashboard': 'home', 'होम': 'home',
      };
      
      const lower = text.toLowerCase();
      for (const [keyword, target] of Object.entries(targetMap)) {
        if (lower.includes(keyword)) {
          return { target };
        }
      }
      return { target: 'home' };
    },
  },
  
  // ELIGIBILITY: "check eligibility", "am I eligible"
  {
    intent: 'ELIGIBILITY',
    patterns_en: [
      /(?:check|verify|test)\s+(?:my\s+)?eligib/i,
      /(?:am\s+i|i\s+am)\s+eligib/i,
      /eligib(?:ility|le)/i,
    ],
    patterns_hi: [
      /(?:पात्रता|योग्यता)\s*(?:जांचो|चेक\s+करो|देखो)/i,
      /(?:मैं|क्या\s+मैं)\s+(?:पात्र|योग्य)/i,
    ],
  },
  
  // READ: "read results", "speak results", "tell me"
  {
    intent: 'READ',
    patterns_en: [
      /(?:read|speak|say|tell\s+me)\s+(?:the\s+)?(?:results?|schemes?|output)/i,
      /(?:what\s+are\s+(?:the|my)\s+results)/i,
    ],
    patterns_hi: [
      /(?:पढ़ो|बोलो|सुनाओ)\s+(?:नतीजे|परिणाम|स्कीम)/i,
    ],
  },
];

// --- Intent Classification ---

/**
 * Classify a voice transcript into an actionable intent.
 * Uses pattern matching with ordered priority.
 * 
 * Returns FORM_FILL as default if no navigation/search intent is detected
 * (preserving existing behavior).
 */
export function classifyVoiceIntent(transcript: string, lang: 'en' | 'hi'): VoiceCommand {
  const text = transcript.trim();
  
  for (const intentDef of INTENT_PATTERNS) {
    const patterns = lang === 'hi' ? [...intentDef.patterns_hi, ...intentDef.patterns_en] : [...intentDef.patterns_en, ...intentDef.patterns_hi];
    
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        const entities = intentDef.entityExtractor 
          ? intentDef.entityExtractor(text, lang) 
          : {};
        
        return {
          intent: intentDef.intent,
          entities,
          confidence: 0.85,
          originalText: text,
        };
      }
    }
  }
  
  // Default: treat as form filling (existing behavior)
  return {
    intent: 'FORM_FILL',
    entities: {},
    confidence: 0.5,
    originalText: text,
  };
}

// --- Text-to-Speech ---

/**
 * Speak text aloud using the Web Speech API.
 * Selects appropriate voice for Hindi/English.
 */
export function speak(text: string, lang: 'en' | 'hi'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[TTS] Speech synthesis not available');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices();
  const targetLang = lang === 'hi' ? 'hi' : 'en';
  const matchingVoice = voices.find(v => v.lang.startsWith(targetLang));
  if (matchingVoice) utterance.voice = matchingVoice;
  
  window.speechSynthesis.speak(utterance);
}

/**
 * Stop ongoing speech.
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Generate a human-readable summary of scheme results for TTS.
 */
export function schemesToSpeech(schemes: any[], lang: 'en' | 'hi'): string {
  if (schemes.length === 0) {
    return lang === 'hi' 
      ? 'कोई योजना नहीं मिली। कृपया अपना विवरण अपडेट करें।'
      : 'No schemes found. Please update your details.';
  }
  
  const intro = lang === 'hi'
    ? `${schemes.length} योजनाएं मिलीं। `
    : `Found ${schemes.length} schemes. `;
  
  const schemeList = schemes.slice(0, 3).map((s, i) => {
    const name = s.name || s.scheme?.name || 'Unknown';
    return lang === 'hi'
      ? `${i + 1}. ${name}`
      : `${i + 1}. ${name}`;
  }).join('. ');
  
  return intro + schemeList;
}
