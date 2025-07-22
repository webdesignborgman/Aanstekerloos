"use client";
import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  chipColor?: string; // extra: custom kleur via Tailwind classes
}

export function MultiSelectComboBox({
  options, selected, onChange, placeholder, chipColor = "bg-gray-200 text-gray-800"
}: Props) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleOption = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="relative min-w-[120px] max-w-xs" ref={boxRef}>
      <div
        className={cn(
          "flex items-center gap-1 flex-wrap px-2 py-1 rounded-lg border border-gray-300 bg-white cursor-pointer",
          "focus-within:ring-2 ring-green-400 transition text-xs",
          open && "ring-2 ring-green-500"
        )}
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected.length === 0 && (
          <span className="text-gray-400">{placeholder || "Selecteer..."}</span>
        )}
        {selected.map(val => (
          <span
            key={val}
            className={cn("flex items-center rounded-full px-2 py-0.5 mr-1 mb-1", chipColor)}
            onClick={e => { e.stopPropagation(); toggleOption(val); }}
          >
            {val}
            <X size={12} className="ml-1 cursor-pointer" />
          </span>
        ))}
        <ChevronDown size={14} className="ml-auto text-gray-400" />
      </div>
      {open && (
        <div
          className="absolute left-0 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-lg z-30 max-h-44 overflow-auto animate-in fade-in"
        >
          {options.map(val => (
            <label
              key={val}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-green-50 text-xs"
            >
              <input
                type="checkbox"
                className="accent-green-500"
                checked={selected.includes(val)}
                onChange={() => toggleOption(val)}
                tabIndex={-1}
              />
              {val}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
