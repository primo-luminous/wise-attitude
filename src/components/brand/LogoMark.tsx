interface LogoMarkProps {
  size?: number;
  className?: string;
}

export default function LogoMark({ size = 32, className = "" }: LogoMarkProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-xs">WA</span>
      </div>
    </div>
  );
}
