// Logo Component para Carwash Peña Blanca
// Usando SVG inline para evitar problemas de importación

interface LogoComponentProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export const LogoComponent = ({ size = "medium", className = "" }: LogoComponentProps) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12", 
    large: "w-20 h-20"
  };

  return (
    <div className={`bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-200 overflow-hidden ${sizeClasses[size]} ${className}`}>
      <svg className="w-3/4 h-3/4 text-white" viewBox="0 0 256 256" fill="currentColor">
        <rect width="256" height="256" fill="currentColor" rx="32" opacity="0.1"/>
        <path d="M64 192h128v16H64zm32-32h64v16H96zm-16-32h96v16H80zm8-32h80v16H88z" fill="currentColor"/>
        <text x="128" y="80" textAnchor="middle" fill="currentColor" fontFamily="Arial" fontSize="24" fontWeight="bold">CW</text>
      </svg>
    </div>
  );
};

export default LogoComponent;