"use client";

import { useEffect, useRef, useState } from "react";

interface PriceFlashProps {
    value: string | number;
    className?: string;
    children?: React.ReactNode;
}

export default function PriceFlash({ value, className = "", children }: PriceFlashProps) {
    const prevValueRef = useRef<string | number>(value);
    const [flashClass, setFlashClass] = useState("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const prevValue = prevValueRef.current;
        const currentValStr = String(value ?? "");
        const prevValStr = String(prevValue ?? "");

        if (currentValStr !== prevValStr && currentValStr !== "--" && prevValStr !== "--") {
            const current = parseFloat(currentValStr.replace(/,/g, ""));
            const previous = parseFloat(prevValStr.replace(/,/g, ""));

            if (!isNaN(current) && !isNaN(previous)) {
                if (current > previous) {
                    setFlashClass("animate-flash-up text-green-600 dark:text-green-500");
                } else if (current < previous) {
                    setFlashClass("animate-flash-down text-red-600 dark:text-red-500");
                }

                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                    setFlashClass("");
                }, 800);
            }
        }
        prevValueRef.current = value;
    }, [value]);

    // Merge flash class with existing className, flash class takes precedence for color
    // A simple approach is appending.
    return (
        <span className={`transition-colors duration-200 inline-block ${className} ${flashClass}`}>
            {children || value}
        </span>
    );
}
