import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type MobileLanguage = "en" | "si" | "ta";

const dictionaries = {
  en: {
    language: "Language",
    welcome: "Welcome",
    signOut: "Sign out",
    assignedJobs: "Assigned Jobs",
    completed: "Completed",
    fieldModules: "Field Technician Modules",
    stockCount: "Van Stock Count",
    stockHint: "Blind count. The system quantity stays hidden until you submit.",
    notifications: "Notifications",
    holdApprovals: "Hold approvals",
    holdWaiting: "Waiting for a coordinator. The job is not on hold yet.",
    expectedResume: "Expected resume date",
    submitHold: "Submit hold for approval",
    approve: "Approve",
    reject: "Reject",
    scanBarcode: "Scan barcode",
    closeScanner: "Close scanner",
    enterCode: "Type the code if the camera cannot read it",
    noSystemQty: "System quantity is hidden for this blind count.",
    submitCount: "Submit stock count",
    refusedToSign: "Customer refused to sign",
    refusalReason: "Reason for refusal",
    downloadReport: "Download service report",
    partial: "Partial completion",
    warranty: "Trigger warranty",
    pairing: "Install location, pairing, and tests",
    serial: "Installed serial",
    pairedSerial: "Paired component serial",
    override: "Supervisor override reason",
    pressure: "Pressure test",
    extraMaterial: "Extra material",
    online: "Online",
    offline: "Offline",
  },
  si: {
    language: "භාෂාව",
    welcome: "ආයුබෝවන්",
    signOut: "ඉවත් වන්න",
    assignedJobs: "පවරන ලද රැකියා",
    completed: "අවසන්",
    fieldModules: "ක්ෂේත්‍ර ඒකක",
    stockCount: "වෑන් තොග ගණනය",
    stockHint: "අන්ධ ගණනය. ඉදිරිපත් කරන තුරු පද්ධති ප්‍රමාණය සඟවා ඇත.",
    notifications: "දැනුම්දීම්",
    holdApprovals: "අත්හිටුවීම් අනුමැතිය",
    holdWaiting: "සම්බන්ධීකරුගේ අනුමැතිය බලාපොරොත්තුවෙන්. රැකියාව තවම අත්හිටුවා නැත.",
    expectedResume: "නැවත ආරම්භ කිරීමට බලාපොරොත්තු දිනය",
    submitHold: "අනුමැතිය සඳහා අත්හිටුවීම යවන්න",
    approve: "අනුමත කරන්න",
    reject: "ප්‍රතික්ෂේප කරන්න",
    scanBarcode: "බාර්කෝඩ් ස්කෑන් කරන්න",
    closeScanner: "ස්කෑනරය වසන්න",
    enterCode: "කැමරාවට කියවිය නොහැකි නම් කේතය ටයිප් කරන්න",
    noSystemQty: "මෙම අන්ධ ගණනයේදී පද්ධති ප්‍රමාණය සඟවා ඇත.",
    submitCount: "තොග ගණනය ඉදිරිපත් කරන්න",
    refusedToSign: "පාරිභෝගිකයා අත්සන් කිරීම ප්‍රතික්ෂේප කළේය",
    refusalReason: "ප්‍රතික්ෂේප කිරීමට හේතුව",
    downloadReport: "සේවා වාර්තාව බාගන්න",
    partial: "අර්ධ අවසන් කිරීම",
    warranty: "වගකීම් සක්‍රිය කරන්න",
    pairing: "ස්ථාපන ස්ථානය, යුගල කිරීම සහ පරීක්ෂණ",
    serial: "ස්ථාපිත අනුක්‍රමික අංකය",
    pairedSerial: "යුගල කළ සංරචක අංකය",
    override: "අධීක්ෂක අභිබවා යාමේ හේතුව",
    pressure: "පීඩන පරීක්ෂණය",
    extraMaterial: "අමතර ද්‍රව්‍ය",
    online: "සබැඳි",
    offline: "නොබැඳි",
  },
  ta: {
    language: "மொழி",
    welcome: "வரவேற்பு",
    signOut: "வெளியேறு",
    assignedJobs: "ஒதுக்கப்பட்ட பணிகள்",
    completed: "முடிந்தவை",
    fieldModules: "களப் பிரிவுகள்",
    stockCount: "வேன் இருப்பு எண்ணிக்கை",
    stockHint: "குருட்டு எண்ணிக்கை. சமர்ப்பிக்கும் வரை கணினி அளவு மறைக்கப்படும்.",
    notifications: "அறிவிப்புகள்",
    holdApprovals: "நிறுத்த அனுமதிகள்",
    holdWaiting: "ஒருங்கிணைப்பாளர் அனுமதிக்காக காத்திருக்கிறது. பணி இன்னும் நிறுத்தப்படவில்லை.",
    expectedResume: "எதிர்பார்க்கும் மறுதொடக்க தேதி",
    submitHold: "அனுமதிக்கு நிறுத்தத்தை அனுப்பு",
    approve: "அனுமதி",
    reject: "நிராகரி",
    scanBarcode: "பார்கோடு ஸ்கேன்",
    closeScanner: "ஸ்கேனரை மூடு",
    enterCode: "கேமரா படிக்கவில்லை என்றால் குறியீட்டை உள்ளிடவும்",
    noSystemQty: "இந்த குருட்டு எண்ணிக்கையில் கணினி அளவு மறைக்கப்பட்டுள்ளது.",
    submitCount: "இருப்பு எண்ணிக்கையை சமர்ப்பி",
    refusedToSign: "வாடிக்கையாளர் கையெழுத்தை மறுத்தார்",
    refusalReason: "மறுப்புக்கான காரணம்",
    downloadReport: "சேவை அறிக்கையை பதிவிறக்கு",
    partial: "பகுதி நிறைவு",
    warranty: "உத்தரவாதத்தை இயக்கு",
    pairing: "நிறுவல் இடம், இணைப்பு மற்றும் சோதனை",
    serial: "நிறுவப்பட்ட வரிசை எண்",
    pairedSerial: "இணைக்கப்பட்ட கூறு எண்",
    override: "மேற்பார்வையாளர் விலக்கு காரணம்",
    pressure: "அழுத்த சோதனை",
    extraMaterial: "கூடுதல் பொருள்",
    online: "இணைப்பில்",
    offline: "இணைப்பில்லை",
  },
} as const;

export type MobileTextKey = keyof typeof dictionaries.en;

const MobileI18nContext = createContext<{
  language: MobileLanguage;
  setLanguage: (language: MobileLanguage) => void;
  t: (key: MobileTextKey) => string;
} | null>(null);

export function MobileI18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<MobileLanguage>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("telesonic_mobile_lang");
      if (saved === "si" || saved === "ta" || saved === "en") {
        setLanguageState(saved);
        document.documentElement.lang = saved === "en" ? "en" : saved;
      }
    } catch {
      // Private mode can block storage. English remains available.
    }
  }, []);

  const setLanguage = (next: MobileLanguage) => {
    setLanguageState(next);
    try {
      localStorage.setItem("telesonic_mobile_lang", next);
    } catch {
      // Ignore storage failures.
    }
    document.documentElement.lang = next === "en" ? "en" : next;
  };

  const t = (key: MobileTextKey) => dictionaries[language][key] || dictionaries.en[key];

  return (
    <MobileI18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </MobileI18nContext.Provider>
  );
}

export function useMobileI18n() {
  const context = useContext(MobileI18nContext);
  if (!context) {
    return {
      language: "en" as MobileLanguage,
      setLanguage: () => undefined,
      t: (key: MobileTextKey) => dictionaries.en[key],
    };
  }
  return context;
}

export function MobileLanguageSwitch() {
  const { language, setLanguage, t } = useMobileI18n();
  return (
    <label className="flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
      <span>{t("language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as MobileLanguage)}
        className="input-field h-7 w-auto py-0 text-[11px]"
        aria-label={t("language")}
      >
        <option value="en">English</option>
        <option value="si">සිංහල</option>
        <option value="ta">தமிழ்</option>
      </select>
    </label>
  );
}
