import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false
}: StarRatingProps) => {
  const [hoveredValue, setHoveredValue] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  const handleClick = (starValue: number) => {
    if (!readonly && onChange) {
      onChange(starValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (readonly) return;
    
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(starValue);
    }
    if (e.key === "ArrowLeft" && starValue > 1) {
      e.preventDefault();
      handleClick(starValue - 1);
    }
    if (e.key === "ArrowRight" && starValue < 5) {
      e.preventDefault();
      handleClick(starValue + 1);
    }
  };

  const displayValue = hoveredValue || value;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            className={cn(
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm transition-colors",
              !readonly && "hover:scale-110",
              readonly && "cursor-default"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readonly && setHoveredValue(starValue)}
            onMouseLeave={() => !readonly && setHoveredValue(0)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
            disabled={readonly}
            tabIndex={readonly ? -1 : 0}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                starValue <= displayValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-2">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};