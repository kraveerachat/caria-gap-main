"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, ExternalLink, ChevronRight, Briefcase, Code2, Palette, Video } from "lucide-react";
import mockCareers from "@/lib/mock_careers.json";
import { CAREER_THAI_NAMES } from "@/lib/career-translations";

interface CareerItem {
  career_id: string;
  career_name: string;
  career_group: string;
  program: string;
}

interface DreamCareerSelectCardProps {
  onContinue: (careerId: string, careerGroup: string) => void;
  lang: "th" | "en";
}

// Map career group to YouTube video guide URLs as per Dynamic Routing
function getCareerGroupVideoUrl(careerGroup: string, program: string): string {
  const dt = program === "DT";
  
  if (dt) {
    if (careerGroup === "Data Science") {
      return "https://www.youtube.com/watch?v=0idsNIH5DjA&list=PL8zUbs3RnlDVfH51vBN8omCozta8sMRdU";
    }
    if (careerGroup === "Cloud Technology" || careerGroup === "AI & Emerging Technology") {
      return "https://www.youtube.com/watch?v=Xw7Rjs8ne6A";
    }
    return "https://www.youtube.com/watch?v=nn0Lm-PiXxA&list=PL8zUbs3RnlDVfH51vBN8omCozta8sMRdU";
  } else {
    if (careerGroup === "Animation") {
      return "https://www.youtube.com/watch?v=SW3kvm92iRA";
    }
    if (careerGroup === "Film") {
      return "https://www.youtube.com/watch?v=R4z-RO0ZYF4";
    }
    if (careerGroup === "Game") {
      return "https://www.youtube.com/watch?v=MiLbStEiLss";
    }
    if (careerGroup === "New Media") {
      return "https://www.youtube.com/watch?v=HK4MjUz1JpI";
    }
    if (careerGroup === "Interactive Media") {
      return "https://www.youtube.com/watch?v=ptjXjRmed0k";
    }
    if (careerGroup === "Digital Content") {
      return "https://www.youtube.com/watch?v=ErPndAsf400";
    }
    return "https://www.youtube.com/watch?v=iOvbvRG7r9I";
  }
}

export function DreamCareerSelectCard({ onContinue, lang }: DreamCareerSelectCardProps) {
  const thai = lang === "th";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareer, setSelectedCareer] = useState<CareerItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter careers based on search query
  const filteredCareers = (mockCareers as CareerItem[]).filter((c) => {
    const nameEn = c.career_name.toLowerCase();
    const nameTh = (CAREER_THAI_NAMES[c.career_id] || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return nameEn.includes(query) || nameTh.includes(query);
  });

  const dtCareers = filteredCareers.filter((c) => c.program === "DT");
  const dcCareers = filteredCareers.filter((c) => c.program === "DM"); // DM is DC in DB

  const handleSelect = (career: CareerItem) => {
    setSelectedCareer(career);
    setSearchQuery(thai ? (CAREER_THAI_NAMES[career.career_id] || career.career_name) : career.career_name);
    setIsOpen(false);
    // Persist the choice the moment it is made — so even if the user hits the
    // top-right "Skip" (instead of "Continue"), the dashboard still compares
    // against the career they actually selected.
    if (typeof window !== "undefined") {
      const selectedObj = { id: career.career_id, name: career.career_name, group: career.career_group };
      localStorage.setItem("dreamCareer", JSON.stringify(selectedObj));
      localStorage.setItem("user_dream_career", JSON.stringify(selectedObj));
      localStorage.setItem("caria_dream_career_id", career.career_id);
      localStorage.setItem("caria_dream_career_group", career.career_group);
    }
  };

  return (
    <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white/70 p-6 md:p-8 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0f1d]/75 shadow-2xl">
      
      {/* Badge Header */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-orange/20 bg-brand-orange/10">
          <Sparkles size={16} className="text-brand-orange animate-pulse" />
          <span className="text-xs font-bold text-brand-orange">
            {thai ? "การประกาศเป้าหมายอาชีพดิจิทัล" : "Dream Career Declaration"}
          </span>
        </div>
      </div>

      {/* Main Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">
          {thai ? "เป้าหมายของคุณคืออะไร? (Set Your Dream Career)" : "Set Your Dream Career"}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {thai
            ? "เลือก 1 อาชีพดิจิทัลที่คุณใฝ่ฝัน เพื่อให้ AI ของเราวิเคราะห์ว่าทักษะปัจจุบันของคุณ ตรงกับสิ่งที่คุณฝันไว้หรือไม่"
            : "Choose 1 digital career you dream of. Our AI will analyze if your current competencies match your dream path."}
        </p>
      </div>

      {/* Searchable Dropdown Container */}
      <div className="relative mb-8" ref={dropdownRef}>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
          {thai ? "ค้นหาและเลือกอาชีพดิจิทัลของคุณ:" : "Search and Select Your Digital Career:"}
        </label>
        
        <div className="relative">
          <input
            type="text"
            placeholder={thai ? "พิมพ์ชื่ออาชีพเพื่อค้นหา เช่น Software Developer, Graphic" : "Type to search a career, e.g. Software Developer, Graphic Designer"}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1220] text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 dark:text-white transition-all shadow-sm font-semibold"
          />
          <Briefcase className="absolute left-4 top-4 size-4 text-slate-400 dark:text-slate-500" />
          
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCareer(null);
                setIsOpen(true);
                // Clear the persisted choice too, so a later skip won't reuse it.
                if (typeof window !== "undefined") {
                  ["dreamCareer", "user_dream_career", "caria_dream_career_id", "caria_dream_career_group"].forEach(
                    (k) => localStorage.removeItem(k),
                  );
                }
              }}
              className="absolute right-4 top-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown Options Overlay */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-2xl max-h-72 overflow-y-auto backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* DT Program Group */}
            {dtCareers.length > 0 && (
              <div>
                <div className="sticky top-0 flex items-center gap-1.5 bg-[#002F6C]/10 px-4 py-2 font-syne text-[10px] font-bold uppercase tracking-[0.18em] text-[#002F6C] backdrop-blur-md dark:bg-[#002F6C]/35 dark:text-[#9CC3FF]">
                  <Code2 className="size-3" strokeWidth={2.5} aria-hidden />
                  Digital Technology (DT) · {dtCareers.length} {thai ? "อาชีพ" : "Careers"}
                </div>
                {dtCareers.map((c) => (
                  <button
                    key={c.career_id}
                    onClick={() => handleSelect(c)}
                    className="w-full text-left px-5 py-3 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors border-b border-slate-100 dark:border-white/2"
                  >
                    <span className="font-bold mr-2 text-slate-400 dark:text-slate-500">{c.career_id}</span>
                    <span className="font-semibold">{thai ? (CAREER_THAI_NAMES[c.career_id] || c.career_name) : c.career_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* DC Program Group */}
            {dcCareers.length > 0 && (
              <div>
                <div className="sticky top-0 flex items-center gap-1.5 bg-brand-orange/10 px-4 py-2 font-syne text-[10px] font-bold uppercase tracking-[0.18em] text-brand-orange backdrop-blur-md dark:bg-brand-orange/15">
                  <Palette className="size-3" strokeWidth={2.5} aria-hidden />
                  Digital Communication (DC) · {dcCareers.length} {thai ? "อาชีพ" : "Careers"}
                </div>
                {dcCareers.map((c) => (
                  <button
                    key={c.career_id}
                    onClick={() => handleSelect(c)}
                    className="w-full text-left px-5 py-3 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors border-b border-slate-100 dark:border-white/2"
                  >
                    <span className="font-bold mr-2 text-slate-400 dark:text-slate-500">{c.career_id}</span>
                    <span className="font-semibold">{thai ? (CAREER_THAI_NAMES[c.career_id] || c.career_name) : c.career_name}</span>
                  </button>
                ))}
              </div>
            )}

            {filteredCareers.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-5 py-6 text-center font-medium text-slate-400 dark:text-slate-500">
                <Search className="size-4 opacity-60" strokeWidth={2} aria-hidden />
                <span className="text-xs leading-relaxed">
                  {thai ? "ไม่พบข้อมูลอาชีพที่ตรงกัน" : "No matching careers found"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Career Summary & Video Link Card */}
      {selectedCareer && (
        <div className="mb-8 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
              {thai ? "อาชีพที่คุณใฝ่ฝัน:" : "Your Declared Dream Career:"}
            </span>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white">
              {thai ? (CAREER_THAI_NAMES[selectedCareer.career_id] || selectedCareer.career_name) : selectedCareer.career_name}
            </h4>
            <div className="mt-1.5 flex flex-wrap gap-2 items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                selectedCareer.program === "DT"
                  ? "bg-[#002F6C]/10 border-[#002F6C]/25 text-[#002F6C] dark:bg-[#002F6C]/35 dark:border-[#9CC3FF]/30 dark:text-[#9CC3FF]"
                  : "bg-brand-orange/10 border-brand-orange/20 text-brand-orange"
              }`}>
                {selectedCareer.program === "DT" ? "Digital Technology (DT)" : "Digital Communication (DC)"}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                {thai ? `กลุ่มอาชีพหลัก: ${selectedCareer.career_group}` : `Main Group: ${selectedCareer.career_group}`}
              </span>
            </div>
          </div>

          <a
            href={getCareerGroupVideoUrl(selectedCareer.career_group, selectedCareer.program)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-bold text-slate-700 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-brand-orange/40 hover:text-brand-orange active:scale-95 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
          >
            <Video className="size-3.5" strokeWidth={2.5} aria-hidden />
            <span>{thai ? "ทำความรู้จักสายอาชีพนี้" : "Watch Career Video"}</span>
            <ExternalLink className="size-3" strokeWidth={2.5} aria-hidden />
          </a>
        </div>
      )}

      {/* Call to Action Button */}
      <button
        onClick={() => selectedCareer && onContinue(selectedCareer.career_id, selectedCareer.career_group)}
        disabled={!selectedCareer}
        className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
          selectedCareer
            ? "bg-brand-orange text-white hover:scale-[1.02] hover:shadow-brand-orange/20 active:scale-98"
            : "bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed"
        }`}
      >
        <span>{thai ? "ถัดไป (Continue)" : "Continue"}</span>
        <ChevronRight size={16} />
      </button>

    </div>
  );
}
