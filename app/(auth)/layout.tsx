export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F7FA] via-white to-[#E8F5F0]">
        {/* Mesh gradient blobs */}
        <div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full animate-mesh"
          style={{
            background: 'radial-gradient(circle, rgba(0,145,110,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/3 -right-20 w-96 h-96 rounded-full animate-mesh"
          style={{
            background: 'radial-gradient(circle, rgba(0,179,134,0.08) 0%, transparent 70%)',
            animationDelay: '-5s',
          }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full animate-mesh"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
            animationDelay: '-10s',
          }}
        />
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #00916E 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
