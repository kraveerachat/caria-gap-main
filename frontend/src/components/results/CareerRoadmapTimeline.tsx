"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Code2, 
  Cloud, 
  Database, 
  Tv, 
  Palette, 
  Mic, 
  Gamepad2, 
  Video, 
  Megaphone, 
  Smartphone, 
  Sparkles, 
  PlayCircle,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import Image from "next/image";

export function CareerRoadmapTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { lang } = useLanguage();
  const thai = lang === "th";
  const [activeTab, setActiveTab] = useState<"DT" | "DC">("DT");

  // DT Curriculum Professional Groups
  const dtGroups = [
    {
      title: thai ? "กลุ่มวิชาชีพด้านพัฒนาซอฟต์แวร์" : "Software Development Group",
      description: thai ? "การพัฒนาซอฟต์แวร์และแอปพลิเคชันระบบ" : "Software & systems application development",
      icon: Code2,
      url: "https://www.youtube.com/watch?v=nn0Lm-PiXxA&list=PL8zUbs3RnlDVfH51vBN8omCozta8sMRdU",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      borderColor: "hover:border-blue-500/50"
    },
    {
      title: thai ? "กลุ่มวิชาชีพด้านเทคโนโลยีคลาวด์" : "Cloud Technology Group",
      description: thai ? "การจัดการระบบคลาวด์และเครือข่ายความปลอดภัย" : "Cloud infrastructure & secure network management",
      icon: Cloud,
      url: "https://www.youtube.com/watch?v=Xw7Rjs8ne6A",
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      borderColor: "hover:border-sky-500/50"
    },
    {
      title: thai ? "กลุ่มวิชาชีพด้านวิทยาศาสตร์ข้อมูลและสารสนเทศ" : "Data Science & Info Group",
      description: thai ? "การวิเคราะห์ข้อมูลขนาดใหญ่และวิทยาศาสตร์ข้อมูล" : "Big data analytics & data science solutions",
      icon: Database,
      url: "https://www.youtube.com/watch?v=0idsNIH5DjA&list=PL8zUbs3RnlDU-OtbB2qICnlzP4gEImQGm",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      borderColor: "hover:border-indigo-500/50"
    },
    {
      title: thai ? "ชมคลิปแนะนำกลุ่มวิชาชีพทั้งหมด (DT)" : "Watch All DT Group Videos",
      description: thai ? "เพลย์ลิสต์แนะนำแนวทางอาชีพของสายเทคโนโลยีดิจิทัลทั้งหมด" : "Playlist of all Digital Technology career guidance clips",
      icon: PlayCircle,
      url: "https://www.youtube.com/playlist?list=PL8zUbs3RnlDU7PkSbdO3vE6e_Dqawkm1e",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      borderColor: "hover:border-emerald-500/50",
      isPlaylist: true
    }
  ];

  // DC Curriculum Professional Groups
  const dcGroups = [
    {
      title: thai ? "กลุ่มวิชาชีพด้านการออกแบบวิชวล" : "Visual Design Group",
      description: thai ? "การออกแบบกราฟิก สื่อสิ่งพิมพ์ และแบรนดิ้ง" : "Graphic design, print media, and branding design",
      icon: Palette,
      url: "https://www.youtube.com/watch?v=ptjXjRmed0k",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      borderColor: "hover:border-pink-500/50"
    },
    {
      title: thai ? "กลุ่มวิชาชีพด้านเนื้อหาดิจิทัล" : "Digital Content Group",
      description: thai ? "การสร้างสรรค์เนื้อหา บทความ คอนเทนต์บล็อกเกอร์" : "Content creation, copywriting & blogging",
      icon: Mic,
      url: "https://www.youtube.com/watch?v=ErPndAsf400",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      borderColor: "hover:border-purple-500/50"
    },
    {
      title: thai ? "กลุ่มวิชาชีพด้านแอนิเมชัน" : "Animation Group",
      description: thai ? "การวาดและการทำภาพเคลื่อนไหวแบบ 2D และ 3D" : "2D & 3D motion graphics & character animation",
      icon: Sparkles,
      url: "https://www.youtube.com/watch?v=SW3kvm92iRA",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      borderColor: "hover:border-amber-500/50"
    },
    {
      title: thai ? "กลุ่มวิชาชีพด้านวิดีทัศน์ดิจิทัล" : "Digital Video Group",
      description: thai ? "การถ่ายทำและตัดต่อวิดีโอระดับมืออาชีพ" : "Professional video production & post-editing",
      icon: Video,
      url: "https://www.youtube.com/watch?v=R4z-RO0ZYF4",
      color: "text-red-500",
      bg: "bg-red-500/10",
      borderColor: "hover:border-red-500/50"
    },
    {
      title: thai ? "กลุ่มวิชาชีพด้านเกม" : "Game Professional Group",
      description: thai ? "การพัฒนา คอนเซปต์เกม และการออกแบบประสบการณ์ผู้เล่น" : "Game dev, concepts, and gamer UX design",
      icon: Gamepad2,
      url: "https://www.youtube.com/watch?v=MiLbStEiLss",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      borderColor: "hover:border-violet-500/50"
    },
    {
      title: thai ? "กลุ่มวิชาชีพด้านการวางแผนสื่อดิจิทัล" : "Digital Media Planning Group",
      description: thai ? "การบริหารจัดการช่องทางแคมเปญและการตลาดดิจิทัล" : "Digital marketing channels & campaign management",
      icon: Megaphone,
      url: "https://www.youtube.com/watch?v=iOvbvRG7r9I",
      color: "text-brand-orange",
      bg: "bg-brand-orange/10",
      borderColor: "hover:border-brand-orange/50"
    },
    {
      title: thai ? "กลุ่มวิชาชีพด้านการรายงานข่าวแบบเรียลไทม์" : "Real-time News Reporting Group",
      description: thai ? "การรายงานข่าวสารยุคดิจิทัลที่ทันสถานการณ์" : "Broadcasting & fast-paced digital journalism",
      icon: Tv,
      url: "https://www.youtube.com/watch?v=HK4MjUz1JpI",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      borderColor: "hover:border-blue-500/50"
    },
    {
      title: thai ? "กลุ่มวิชาชีพด้านโปรแกรมประยุกต์" : "Mobile Applications Group",
      description: thai ? "การคิดค้นสื่อและโปรแกรมประยุกต์เพื่อการบริการ" : "App design & digital media services",
      icon: Smartphone,
      url: "https://www.youtube.com/watch?v=Kj_Si81JgXU",
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      borderColor: "hover:border-teal-500/50"
    },
    {
      title: thai ? "ชมคลิปแนะนำกลุ่มวิชาชีพทั้งหมด (DC)" : "Watch All DC Group Videos",
      description: thai ? "เพลย์ลิสต์แนะนำแนวทางอาชีพของสายนิเทศศาสตร์ดิจิทัลทั้งหมด" : "Playlist of all Digital Communication career guidance clips",
      icon: PlayCircle,
      url: "https://www.youtube.com/playlist?list=PL8zUbs3RnlDXNIO9ZUoDHtShBNJgbAzLP",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      borderColor: "hover:border-emerald-500/50",
      isPlaylist: true
    }
  ];

  const additionalPrograms = [
    {
      title: thai ? "หลักสูตรปริญญาโท (Digital Master)" : "Master's Program (Digital Master)",
      description: thai 
        ? "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาเทคโนโลยีและนวัตกรรมดิจิทัล มุ่งสร้างผู้นำการเปลี่ยนแปลง"
        : "M.Sc. in Digital Technology & Innovation focusing on leading digital transformation.",
      image: "/images/sut_students3.png",
      url: "https://digitech.sut.ac.th/digital-master"
    },
    {
      title: thai ? "หลักสูตรปริญญาเอก (Digital PhD)" : "Doctoral Program (Digital PhD)",
      description: thai 
        ? "หลักสูตรปรัชญาดุษฎีบัณฑิต มุ่งสร้างนักวิจัยและนักวิชาการขั้นสูงด้านเทคโนโลยีดิจิทัลระดับสากล"
        : "Ph.D. in Digital Technology aimed at developing high-caliber international researchers.",
      image: "/images/sut_students4.png",
      url: "https://digitech.sut.ac.th/digital-phd"
    },
    {
      title: thai ? "โครงการสัมฤทธิบัตร (Certificate)" : "SUT Certificate Program",
      description: thai 
        ? "ระบบเรียนล่วงหน้าเพื่อสะสมหน่วยกิต (Credit Bank) เปิดรับนักเรียน บุคคลทั่วไป และผู้ต้องการต่อยอดระดับบัณฑิตศึกษา"
        : "Pre-enrollment credit bank system open for schools, professionals, and graduate level preparation.",
      image: "/images/sut_students5.png",
      url: "https://digitech.sut.ac.th/apply-certificate"
    },
    {
      title: thai ? "หลักสูตรระยะสั้นและอื่น ๆ" : "Short Courses & Other Programs",
      description: thai 
        ? "การอบรมพัฒนาทักษะดิจิทัลเฉพาะทาง Upskill และ Reskill สำหรับองค์กรและบุคคลทั่วไป"
        : "Specially tailored short courses, workshops, and Upskill/Reskill services for corporate and public learners.",
      image: "/images/sut_students6.png",
      url: "https://digitech.sut.ac.th/programs#others"
    }
  ];

  const currentGroups = activeTab === "DT" ? dtGroups : dcGroups;

  return (
    <div 
      ref={ref} 
      className="relative w-full mt-24 pt-20 border-t border-slate-200/80 dark:border-white/5 transition-all duration-500"
    >
      {/* Background decoration flares */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/3 dark:bg-brand-orange/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/3 dark:bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-slate-400 mb-4">
            <GraduationCap size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {thai ? "หลักสูตร DIGITECH มทส." : "SUT DIGITECH CURRICULUM"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {thai ? "เลือกเส้นทางดิจิทัลของคุณกับหลักสูตร" : "Design Your Digital Path with"}{" "}
            <span className="bg-linear-to-r from-brand-orange to-amber-500 bg-clip-text text-transparent">
              {thai ? "DIGITECH มทส." : "SUT DIGITECH"}
            </span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {thai 
              ? "หลักสูตรสารสนเทศศาสตรบัณฑิต สำนักวิชาศาสตร์และศิลป์ดิจิทัล มหาวิทยาลัยเทคโนโลยีสุรนารี มุ่งสร้างสรรค์และเตรียมความพร้อมสู่สายงานดิจิทัล"
              : "Bachelor of Information Science programs from the Institute of Digital Arts and Sciences, Suranaree University of Technology."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Column Left: High-Impact Student/Campus Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="relative group overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-white/5 bg-slate-100 dark:bg-slate-950/20 backdrop-blur-md shadow-xl h-full min-h-[300px] sm:min-h-[400px]">
              <Image 
                src={activeTab === "DT" ? "/images/sut_students1.png" : "/images/sut_students2.png"} 
                alt="SUT DIGITECH Student Environment"
                fill
                sizes="(max-w-768px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Soft overlay gradient on the image */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block rounded bg-brand-orange text-brand-orange-foreground font-bold px-2 py-0.5 text-[9px] uppercase tracking-wider mb-2">
                  {thai ? "การศึกษาชั้นนำ" : "Premier Education"}
                </span>
                <h4 className="text-lg font-bold text-white leading-snug">
                  {thai ? "มุ่งเน้นการลงมือปฏิบัติจริง สู่การเป็นมืออาชีพดิจิทัล" : "Hands-on Learning for Digital Professionals"}
                </h4>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  {thai 
                    ? `บรรยากาศการเรียนสาขา${activeTab === "DT" ? "เทคโนโลยีดิจิทัล" : "นิเทศศาสตร์ดิจิทัล"} มทส.` 
                    : `Study atmosphere of ${activeTab === "DT" ? "Digital Technology" : "Digital Communication"} at SUT.`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Column Right: Interactive Curriculum Switcher + Card Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-7 flex flex-col"
          >
            {/* Tab switch between DT and DC */}
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 self-center lg:self-start mb-6 shadow-sm relative z-20">
              <button
                onClick={() => setActiveTab("DT")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${
                  activeTab === "DT"
                    ? "bg-[#2563EB] text-white shadow-md"
                    : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {thai ? "เทคโนโลยีดิจิทัล (DT)" : "Digital Technology (DT)"}
              </button>
              <button
                onClick={() => setActiveTab("DC")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${
                  activeTab === "DC"
                    ? "bg-[#F39200] text-[#050A14] shadow-md"
                    : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {thai ? "นิเทศศาสตร์ดิจิทัล (DC)" : "Digital Communication (DC)"}
              </button>
            </div>

            {/* Grid of professional groups cards: 2 columns layout with scrollable overflow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
              {currentGroups.map((group, idx) => {
                const Icon = group.icon;
                const isOddLastDC = activeTab === "DC" && group.isPlaylist; // 9th item in DC spans 2 columns
                return (
                  <a
                    key={idx}
                    href={group.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`group flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0d1726]/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/15 ${isOddLastDC ? "sm:col-span-2" : ""}`}
                  >
                    <div>
                      {/* Top icon and link sign */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className={`p-2.5 rounded-xl ${group.bg} ${group.color} transition-all duration-300 group-hover:scale-110`}>
                          <Icon size={18} />
                        </div>
                        <ExternalLink size={14} className="text-slate-400 dark:text-white/30 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                      </div>

                      {/* Header */}
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white group-hover:text-primary transition-colors leading-snug">
                        {group.title}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-[11px] text-slate-500 dark:text-white/50 leading-relaxed mt-2.5">
                        {group.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-end text-[10px] font-bold text-slate-400 dark:text-white/30 group-hover:text-slate-600 dark:group-hover:text-white/70 transition-colors">
                      {group.isPlaylist ? (thai ? "ชมเพลย์ลิสต์ทั้งหมด →" : "Watch playlist →") : (thai ? "ชมคลิปแนะนำกลุ่ม →" : "Watch guide video →")}
                    </div>
                  </a>
                );
              })}
            </div>
            
            {/* Custom scrollbar styling for the grid container */}
            <style dangerouslySetInnerHTML={{ __html: `
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(148, 163, 184, 0.3);
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(148, 163, 184, 0.5);
              }
              .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
              }
              .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.2);
              }
            `}} />
          </motion.div>
        </div>

        {/* Divider and section for Additional Programs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 pt-16 border-t border-slate-200/80 dark:border-white/5"
        >
          <div className="flex flex-col items-center mb-10">
            <span className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full mb-3">
              {thai ? "หลักสูตรระดับบัณฑิตศึกษาและบริการวิชาการ" : "GRADUATE & ACADEMIC SERVICES"}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white text-center">
              {thai ? "หลักสูตรเพิ่มเติมเพื่อพัฒนาสู่ระดับสากล" : "Additional Programs for Advanced Excellence"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalPrograms.map((prog, idx) => (
              <a
                key={idx}
                href={prog.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0d1726]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/15"
              >
                {/* Thumbnail Image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={prog.image}
                    alt={prog.title}
                    fill
                    sizes="(max-w-768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 to-transparent pointer-events-none" />
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white group-hover:text-primary transition-colors leading-snug">
                      {prog.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-white/50 leading-relaxed mt-2">
                      {prog.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-white/30 group-hover:text-slate-600 dark:group-hover:text-white/70 transition-colors">
                    <span>{thai ? "ดูรายละเอียดหลักสูตร" : "View Program Details"}</span>
                    <ExternalLink size={12} className="opacity-60" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
