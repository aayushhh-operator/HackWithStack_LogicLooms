import logoImage from "../assets/logo.png";

/**
 * MicroLend Logo Component
 *
 * Usage:
 * - <Logo size="sm" /> - Small size (32px)
 * - <Logo size="md" /> - Medium size (40px, default)
 * - <Logo size="lg" /> - Large size (48px)
 * - <Logo showText={false} /> - Icon only
 */

const Logo = ({ size = "md", showText = true, className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Image */}
      <img
        src={logoImage}
        alt="MicroLend"
        className={`${sizeClasses[size]} object-contain`}
      />

      {/* Logo Text */}
      {showText && (
        <span
          className={`font-bold ${textSizes[size]} text-black tracking-tight`}
        >
          MICROLEND
        </span>
      )}
    </div>
  );
};

export default Logo;
