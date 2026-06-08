"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DT_BRANCH, DC_BRANCH, getGroupSlug, CareerGroup } from "@/lib/careers-list";
import { getRequiredCoursesForCareer, SutCourse } from "@/lib/sut-courses";
import { useLanguage } from "@/components/language-provider";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function CareerGroupPage() {
  const params = useParams();
  const { lang } = useLanguage();
  const thai = lang === "th";

  const groupSlug = params.id as string;
  const [selectedCourse, setSelectedCourse] = useState<SutCourse | null>(null);

  // Find matching group by comparing slugified names from DT and DC branches
  const groupData = useMemo(() => {
    const allGroups = [
      ...DT_BRANCH.map(g => ({ ...g, branch: "DT" as const })),
      ...DC_BRANCH.map(g => ({ ...g, branch: "DC" as const }))
    ];
    return allGroups.find(g => getGroupSlug(g.name) === groupSlug);
  }, [groupSlug]);

  // Gather unique required courses for all careers inside this group
  const requiredCourses = useMemo(() => {
    if (!groupData) return [];
    const courseMap = new Map<string, SutCourse>();
    groupData.careers.forEach((c) => {
      const courses = getRequiredCoursesForCareer(c.name, groupData.name);
      courses.forEach((course) => {
        courseMap.set(course.course_id, course);
      });
    });
    return Array.from(courseMap.values()).sort((a, b) => a.course_id.localeCompare(b.course_id));
  }, [groupData]);

  if (!groupData) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">Career Group Not Found</h2>
        <Link href="/" className="px-6 py-3 rounded-full bg-[#F39200] text-black font-bold">
          Return to Home
        </Link>
      </div>
    );
  }

  const isDT = groupData.branch === "DT";
  const branchColor = isDT ? "text-blue-400 border-blue-500/30" : "text-[#F39200] border-[#F39200]/30";
  const branchBg = isDT ? "bg-blue-500/10" : "bg-[#F39200]/10";
  const accentGlow = isDT ? "rgba(37,99,235,0.12)" : "rgba(243,146,0,0.12)";

  return (
    <div className="min-h-screen bg-[#f4f7fc] dark:bg-[#030712] text-slate-800 dark:text-slate-200 transition-colors relative overflow-hidden flex flex-col">
      {/* Background cinematic lights */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${accentGlow} 0%, transparent 60%)`,
        }}
      />
      
      <SiteHeader />

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-20 flex-1">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white pointer-events-auto mb-8 px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur shadow-sm hover:shadow transition-all"
        >
          <span>← {thai ? "ย้อนกลับหน้าหลัก" : "Back to Main"}</span>
        </Link>

        {/* Group Header Card */}
        <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl p-8 mb-10 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold ${branchColor} ${branchBg}`}>
              {groupData.branch} Branch
            </span>
          </div>
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="text-[10px] tracking-widest text-[#F39200] dark:text-amber-400 font-extrabold uppercase">
              {isDT ? "DT - DIGITAL TECHNOLOGY" : "DC - DIGITAL COMMUNICATIONS & MEDIA"}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white leading-tight">
              {groupData.name}
            </h1>
            {thai && groupData.nameTh && (
              <p className="text-lg md:text-xl font-thai text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mt-1">
                {groupData.nameTh}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Sub-careers focused in this group (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F39200]" />
              <h2 className={`text-lg font-bold tracking-wide text-slate-900 dark:text-white ${thai ? "font-thai font-bold" : "font-heading"}`}>
                {thai ? "อาชีพย่อยที่อยู่ในกลุ่มนี้" : "Focused Sub-Careers"}
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {groupData.careers.map((career) => (
                <div
                  key={career.name}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/25 backdrop-blur-md p-5 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {career.name}
                    </h3>
                    {thai && career.nameTh && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-thai font-semibold mt-0.5">
                        {career.nameTh}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3 border-t border-slate-200/50 dark:border-white/5 pt-3 ${thai ? "font-thai" : ""}`}>
                    {thai ? career.description : (career.descriptionEn || career.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Required SUT Courses (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className={`text-lg font-bold tracking-wide text-slate-900 dark:text-white ${thai ? "font-thai font-bold" : "font-heading"}`}>
                {thai ? "รายวิชาบังคับเรียนของกลุ่มอาชีพ (SUT)" : "Compulsory SUT Curriculum"}
              </h2>
            </div>

            {requiredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {requiredCourses.map((course) => (
                  <div
                    key={course.course_id}
                    onClick={() => setSelectedCourse(course)}
                    className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/25 backdrop-blur-md p-5 shadow-sm hover:shadow-md hover:border-blue-400/50 dark:hover:border-blue-400/40 cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          {course.course_id}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {course.credits} {thai ? "หน่วยกิต" : "Credits"}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mt-2">
                        {course.name_en}
                      </h4>
                      {thai && course.name_th && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-thai leading-normal">
                          {course.name_th}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 border-t border-slate-200/50 dark:border-white/5 pt-3">
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                        {course.module}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-blue-500 dark:text-blue-400">
                        Y{course.year} T{course.term}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                <p className="text-slate-500">{thai ? "ไม่มีวิชาเรียนที่แสดงผล" : "No courses mapped for this group"}</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <SiteFooter />

      {/* Course Details Modal Popup */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl z-10 flex flex-col gap-6"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                aria-label="Close course details"
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white/50 text-slate-500 transition-all hover:text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="size-4" strokeWidth={2.5} aria-hidden />
              </button>

              {/* Course Title */}
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                    {selectedCourse.course_id}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-[#F39200] font-extrabold uppercase">
                    SUT Course Curriculum
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mt-2">
                  {selectedCourse.name_en}
                </h3>
                {thai && selectedCourse.name_th && (
                  <p className="text-sm font-thai text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                    {selectedCourse.name_th}
                  </p>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold">{thai ? "หน่วยกิต" : "Credits"}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedCourse.credits}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold">{thai ? "ชั้นปี / เทอม" : "Year / Term"}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Y{selectedCourse.year} / T{selectedCourse.term}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold">{thai ? "หมวดวิชา" : "Module"}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">{selectedCourse.module}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold">{thai ? "วิชาบังคับก่อน" : "Prerequisites"}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {selectedCourse.prerequisite.length > 0 ? selectedCourse.prerequisite.join(", ") : (thai ? "ไม่มี" : "None")}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold tracking-wider">{thai ? "คำอธิบายรายวิชา" : "Description"}</span>
                <p className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-thai ${thai ? "leading-loose" : ""}`}>
                  {selectedCourse.description}
                </p>
              </div>

              {/* Footer CTA */}
              <div className="flex justify-end pt-2 border-t border-slate-200/50 dark:border-white/5">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  {thai ? "ปิด" : "Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
