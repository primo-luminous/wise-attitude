"use client";

import { useEffect, useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  debounceMs = 300,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, onChange, debounceMs]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={placeholder}
      className={`flex-1 rounded-lg border border-white/10 bg-white px-3 py-2
                 text-black placeholder:text-zinc-500 focus:outline-none
                 focus:ring-2 focus:ring-black/10 ${className}`}
    />
  );
}
