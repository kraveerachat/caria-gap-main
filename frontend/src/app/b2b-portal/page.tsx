import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Filter, Lock, Star, ChevronDown, Download } from "lucide-react";

export default function B2BPortalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 pb-20">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">
              <span className="bg-linear-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                CARIA Talent Matcher for HR
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enterprise Dashboard — ค้นหาและปลดล็อคโปรไฟล์นักศึกษาที่ใช่สำหรับบริษัทคุณ
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 p-4 rounded-xl border border-border bg-card backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาทักษะ... เช่น Programming > 80" 
                className="w-full bg-card border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500/50"
                defaultValue="Programming > 80"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600/20 border border-blue-500/30 px-4 py-2 text-sm text-blue-300 hover:bg-blue-600/30 transition-colors">
              <Filter size={16} />
              Apply Filters
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>เรียงตาม:</span>
            <button className="flex items-center gap-1 text-foreground hover:text-blue-300">
              Match Score <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Talent Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-border bg-card backdrop-blur-md overflow-hidden hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold">
                    ต
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Candidate: T***</h3>
                    <p className="text-xs text-muted-foreground">Digital Technology (DT)</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-success">95%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Match Score</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Programming (S20)</span>
                    <span className="text-blue-400 font-mono">92/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[92%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Problem Solving (S03)</span>
                    <span className="text-blue-400 font-mono">85/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[85%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/40">
              <button className="w-full group relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-blue-500/25 flex items-center justify-center gap-2">
                <Lock size={16} className="group-hover:hidden" />
                <Star size={16} className="hidden group-hover:block text-yellow-300" />
                Unlock Profile (5,000 THB)
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-border bg-card backdrop-blur-md overflow-hidden hover:border-blue-500/30 transition-all opacity-80">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                    M***
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Candidate: M***</h3>
                    <p className="text-xs text-muted-foreground">Digital Media (DM)</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-emerald-400">88%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Design (K07)</span>
                    <span className="text-blue-400 font-mono">85/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[85%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-muted/40">
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-muted border border-border px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-all">
                <Lock size={16} />
                Unlock Profile (5,000 THB)
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-border bg-card backdrop-blur-md overflow-hidden hover:border-blue-500/30 transition-all opacity-80">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                    F***
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Candidate: F***</h3>
                    <p className="text-xs text-muted-foreground">Digital Technology (DT)</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-emerald-400">82%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Data Analysis (S15)</span>
                    <span className="text-blue-400 font-mono">80/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[80%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-muted/40">
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-muted border border-border px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-all">
                <Lock size={16} />
                Unlock Profile (5,000 THB)
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
