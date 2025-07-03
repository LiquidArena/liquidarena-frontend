export default function StatsCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
}) {
  return (
    <div className="group relative overflow-hidden group bg-gradient-to-br from-gray-900/50 to-black/30 border border-slate-500/20 rounded-2xl p-2 backdrop-blur-sm hover:shadow-lg/20 hover:shadow-cyan-500/50 transition-all duration-300 ease-in-out">
      <Icon className="w-10 h-10 text-white/5 group-hover:text-white/50 transition-all duration-300 ease-in-out absolute rotate-12 -bottom-1 -left-1" />
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-500 group-hover:text-white text-end italic">
        {value}
      </div>
    </div>
  );
}
