export default function Loader({ fullscreen = false, message = '' }) {
  const base = 'flex flex-col items-center justify-center gap-6';
  const cls  = fullscreen
    ? `${base} fixed inset-0 z-50 bg-gray-950`
    : `${base} min-h-[200px]`;

  return (
    <div className={cls}>
      {/* Spinning ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 border-r-emerald-400 animate-spin" />
        {/* Inner pulse */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 animate-pulse" />
      </div>

      {/* Logo text */}
      <div className="text-center">
        <p className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent animate-pulse tracking-wide">
          FitTrack
        </p>
        {message && <p className="text-gray-500 text-sm mt-1">{message}</p>}
      </div>
    </div>
  );
}
