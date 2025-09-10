import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Reusable search input component with consistent styling
 * @param {string} placeholder - Placeholder text for the input
 * @param {string} value - Current search value
 * @param {Function} onChange - Change handler function
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether the input is disabled
 * @param {Object} props - Additional props to pass to the Input component
 */
export const SearchInput = ({
  placeholder = "Search...",
  value,
  onChange,
  className,
  disabled = false,
  ...props
}) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8"
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};