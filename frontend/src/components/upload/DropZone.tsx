'use client';

import { useState, useRef } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFileSelect?: (file: File | null) => void;
  className?: string;
}

export function DropZone({ onFileSelect, className }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!pdpaAccepted) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        handleFile(droppedFile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (newFile: File) => {
    setFile(newFile);
    if (onFileSelect) onFileSelect(newFile);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (onFileSelect) onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300 bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 w-fit mx-auto cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
        <input 
          type="checkbox" 
          checked={pdpaAccepted} 
          onChange={(e) => setPdpaAccepted(e.target.checked)}
          className="rounded border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-brand-orange focus:ring-brand-orange w-4 h-4"
        />
        ฉันยอมรับเงื่อนไขการใช้งานและนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
      </label>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden min-h-[200px]',
          !pdpaAccepted ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer',
          isDragging && pdpaAccepted
            ? 'border-brand-orange bg-brand-orange/5'
            : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 hover:border-slate-400 dark:hover:border-white/40 hover:bg-slate-100 dark:hover:bg-white/10'
        )}
        onDragEnter={pdpaAccepted ? handleDrag : undefined}
        onDragLeave={pdpaAccepted ? handleDrag : undefined}
        onDragOver={pdpaAccepted ? handleDrag : undefined}
        onDrop={pdpaAccepted ? handleDrop : undefined}
        onClick={() => pdpaAccepted && inputRef.current?.click()}
      >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />

      {file ? (
        <div className="flex flex-col items-center gap-4 text-center p-6 animate-fade-in z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
            <File size={32} />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 dark:text-white">{file.name}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            onClick={removeFile}
            className="mt-2 flex items-center gap-2 rounded-lg bg-slate-200 dark:bg-white/10 px-4 py-2 text-sm font-medium text-slate-700 dark:text-white transition-colors hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400"
          >
            <X size={16} />
            ลบไฟล์นี้
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center p-8 z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-gray-300 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-orange/20 group-hover:text-brand-orange">
            <UploadCloud size={32} />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 dark:text-white mb-1">ลากไฟล์ PDF มาวางที่นี่</p>
            <p className="text-sm text-slate-500 dark:text-gray-400">หรือคลิกเพื่อเลือกไฟล์จากเครื่อง</p>
          </div>
        </div>
      )}
      
      {/* Decorative background animation */}
      {!file && (
        <div className="absolute inset-0 z-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%,transparent_100%)] bg-size-[250%_250%,100%_100%] animate-shimmer pointer-events-none" />
      )}
    </div>
    </div>
  );
}
