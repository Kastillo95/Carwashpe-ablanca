import logoImage from "@assets/IMG_20250706_211100_1752220069225.jpg";

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
    <div className={`bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-200 overflow-hidden ${sizeClasses[size]} ${className}`}>
      <img 
        src={logoImage} 
        alt="Carwash Peña Blanca Logo" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default LogoComponent;