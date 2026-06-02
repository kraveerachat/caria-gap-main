import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

/** Shimmer skeleton placeholder */
function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded-lg',
            'bg-linear-to-r from-white/5 via-white/10 to-white/5',
            'animate-shimmer',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
            className,
          )}
        />
      ))}
    </div>
  );
}

/** Full-page loading animation with CARIA-GAP branding */
function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-linear-to-br from-[#0F172A] to-[#1E293B]">
      {/* Pulsing circles */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" />
        <div
          className="absolute inset-2 rounded-full border-2 border-accent/50 animate-ping"
          style={{ animationDelay: '0.3s' }}
        />
        <div
          className="absolute inset-4 rounded-full border-2 border-accent/70 animate-ping"
          style={{ animationDelay: '0.6s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/sut-caria-logo.png" alt="SUT-CARIA" className="w-14 h-14 object-contain animate-pulse" />
        </div>
      </div>

      {/* Branding */}
      <h2 className="text-xl font-bold gradient-text mb-4">SUT-CARIA</h2>
      
      {/* Shimmer text container */}
      <div className="relative overflow-hidden rounded-md px-4 py-2">
        <p className="text-sm font-medium text-white/80 animate-pulse">
          SUT-CARIA is preparing your advisory data...
        </p>
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  );
}

interface LoadingProps {
  mode?: 'skeleton' | 'fullpage';
  className?: string;
  lines?: number;
}

export default function Loading({ mode = 'skeleton', className, lines }: LoadingProps) {
  if (mode === 'fullpage') {
    return <FullPageLoading />;
  }

  return <Skeleton className={className} lines={lines} />;
}
