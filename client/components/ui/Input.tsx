'use client';

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Search } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = "text", ...props }, ref) => {

    const [showPass, setShowPass] = useState(false);
    const inputType = type === "password" ? (showPass ? "text" : "password") : type;
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
          type={inputType}
          ref={ref}
          className={cn(
            "w-full px-4 py-2 border rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition",
            error ? "border-red-500" : "border-gray-300",
            className
          )}
          {...props}
        />
        {
          type === "password" && (
            <button
            type="button"
            onClick={() => setShowPass((prev) => !prev)}
            className="absolute px-4 cursor-pointer inset-y-0 right-0 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
            >
              {showPass ? <FaEyeSlash /> : <FaEye /> }
            </button>
          )
        }
        {type === "search" && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="w-5 h-5 text-red-600" />
          </div>
        )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
