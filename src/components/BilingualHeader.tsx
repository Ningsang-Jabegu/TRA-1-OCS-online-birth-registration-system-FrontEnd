
import React from "react";

interface BilingualHeaderProps {
  englishTitle: string;
  nepaliTitle: string;
  subtitle?: string;
}

const BilingualHeader: React.FC<BilingualHeaderProps> = ({
  englishTitle,
  nepaliTitle,
  subtitle,
}) => {
  return (
    <div className="certificate-header">
      <div className="flex items-center justify-center">
        <img
          src="/lovable-uploads/f7085682-ba88-4978-b38a-376effea8a87.png"
          alt="Nepal Government Logo"
          className="h-16 w-auto"
        />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-xl md:text-2xl font-bold text-nepal-red">
          {nepaliTitle}
        </h1>
        <h2 className="text-lg md:text-xl font-semibold text-nepal-blue">
          {englishTitle}
        </h2>
        {subtitle && (
          <p className="text-sm md:text-base text-gray-600 italic">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default BilingualHeader;
