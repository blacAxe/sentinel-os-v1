export default function SectionCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="group relative relative rounded-2xl border border-gray-800 bg-gradient-to-b from-black to-gray-950 p-8 shadow-[0_10px_60px_rgba(0,0,0,0.8)] hover:shadow-[0_30px_120px_rgba(59,130,246,0.15)] transition overflow-hidden">
      
      {/* subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-60 pointer-events-none" />

      {/* content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}