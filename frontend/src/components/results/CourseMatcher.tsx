"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUT_COURSES, SutCourse } from "@/lib/sut-courses";
import { DT_BRANCH, DC_BRANCH, CareerGroup } from "@/lib/careers-list";
import { GraduationCap, Link2, BookMarked, Crosshair, X } from "lucide-react";

interface CourseMatcherProps {
  careerName: string;
  gaps: Array<{ competency_id: string; gap_score: number }>;
  lang: "th" | "en";
}

export function CourseMatcher({ careerName, gaps, lang }: CourseMatcherProps) {
  const thai = lang === "th";
  const [selectedCourse, setSelectedCourse] = useState<SutCourse | null>(null);

  // Find career group and other careers in the same group
  const groupDetails = useMemo(() => {
    let foundGroup: CareerGroup | null = null;
    let foundBranch = "";

    // Search DT
    for (const group of DT_BRANCH) {
      if (group.careers.some(c => c.name.toLowerCase() === careerName.toLowerCase() || c.nameTh === careerName)) {
        foundGroup = group;
        foundBranch = "DT (Digital Technology)";
        break;
      }
    }
    // Search DC if not found
    if (!foundGroup) {
      for (const group of DC_BRANCH) {
        if (group.careers.some(c => c.name.toLowerCase() === careerName.toLowerCase() || c.nameTh === careerName)) {
          foundGroup = group;
          foundBranch = "DC (Digital Communication/Media)";
          break;
        }
      }
    }

    return { group: foundGroup, branch: foundBranch };
  }, [careerName]);

  // Find SUT courses matching the user's gaps
  const matchedCourses = useMemo(() => {
    const gapIds = gaps.map(g => g.competency_id);
    const recommended: SutCourse[] = [];

    SUT_COURSES.forEach(course => {
      // If course covers any of the student's gaps
      const matches = course.competency_tags.filter(tag => gapIds.includes(tag));
      if (matches.length > 0) {
        recommended.push(course);
      }
    });

    // Sort by year and term
    return recommended.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.term - b.term;
    });
  }, [gaps]);

  const { group, branch } = groupDetails;

  return (
    <div className="space-y-6">
      
      {/* 1. Career Group & Other Careers Classification */}
      {group && (
        <div className="rounded-2xl border border-border/60 bg-card/50 dark:bg-card/30 backdrop-blur-md p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
              {branch}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500">
              {thai ? "การวิเคราะห์โครงสร้างอาชีพ" : "Career Architecture"}
            </span>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-2">
            {thai ? "กลุ่มอาชีพหลัก:" : "Main Career Group:"}{" "}
            <span className="text-brand-orange font-bold">
              {thai ? (group.nameTh || group.name) : group.name}
            </span>
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {thai 
              ? "อาชีพของคุณได้รับการวิเคราะห์ให้อยู่ในกลุ่มนี้ โดยในหลักสูตรวิชาการของ มทส. มีอาชีพย่อยที่ใช้ฐานสมรรถนะใกล้เคียงกันรองรับ ดังนี้:"
              : "Your target career belongs to this group. SUT's curriculum supports these related careers with similar competency baselines:"}
          </p>

          <div className="flex flex-wrap gap-2">
            {group.careers.map((c, idx) => {
              const isCurrent = c.name.toLowerCase() === careerName.toLowerCase() || c.nameTh === careerName;
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
                    isCurrent
                      ? "border-brand-orange bg-brand-orange/10 font-bold text-brand-orange shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/2 dark:text-slate-400"
                  }`}
                >
                  {isCurrent && <Crosshair className="size-3" strokeWidth={2.5} aria-hidden />}
                  {thai ? (c.nameTh || c.name) : c.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SUT (มทส.) Course Matcher */}
      <div className="rounded-2xl border border-border/60 bg-card/50 dark:bg-card/30 backdrop-blur-md p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <GraduationCap size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {thai ? "การจับคู่รายวิชาหลักสูตร มทส." : "SUT Curriculum Course Mapping"}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {thai ? "รายวิชาในหลักสูตรจริงของมหาวิทยาลัยเพื่อเรียนปิดช่องว่างความรู้" : "Actual university courses to close your gaps"}
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {matchedCourses.length} {thai ? "รายวิชาแนะนำ" : "courses matched"}
          </span>
        </div>

        {matchedCourses.length > 0 ? (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {matchedCourses.map((course) => (
              <div
                key={course.course_id}
                onClick={() => setSelectedCourse(course)}
                className="p-4 rounded-xl border border-border/50 dark:border-white/5 bg-muted/30 dark:bg-white/1 hover:bg-muted/50 dark:hover:bg-white/3 transition-all hover:border-emerald-500/50 dark:hover:border-emerald-500/30 hover:shadow-md cursor-pointer flex flex-col justify-between select-none"
              >
                <div>
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-emerald-500">
                      Code: {course.course_id}
                    </span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-muted/60 dark:bg-white/5 text-muted-foreground">
                      {thai ? `ปี ${course.year} เทอม ${course.term}` : `Y${course.year} / T${course.term}`}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground mb-1">
                    {thai ? course.name_th : course.name_en}
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    {course.credits} {thai ? "หน่วยกิต" : "Credits"} • {course.module}
                  </span>
                  <a
                    href="https://digitech.sut.ac.th/Digitech-Plan/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] font-extrabold text-emerald-500 hover:text-emerald-600 hover:underline flex items-center gap-0.5"
                  >
                    {thai ? "แผนการเรียน" : "Syllabus"}
                    <Link2 size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-border dark:border-white/10 rounded-xl bg-muted/10 dark:bg-white/1">
            <BookMarked size={28} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">
              {thai ? "ไม่มีรายวิชาที่ต้องเรียนเพิ่มเติมในส่วนนี้" : "No matching courses needed for your current level"}
            </p>
          </div>
        )}
      </div>

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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl z-10 flex flex-col gap-6"
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
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                    {selectedCourse.course_id}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-[#F39200] font-extrabold uppercase">
                    SUT Course Curriculum
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mt-2 font-thai">
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
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-thai leading-loose">
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
