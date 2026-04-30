const BrandLogo = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300/90 to-blue-500/90 text-[11px] font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20">
        SB
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-300" />
      </div>
      {!compact ? (
        <div>
          <p className="text-lg font-bold leading-none text-white">SplitBuddy</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/80">Smart Splits</p>
        </div>
      ) : null}
    </div>
  );
};

export default BrandLogo;
