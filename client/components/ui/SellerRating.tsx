"use client";

import { Star } from "lucide-react";

interface SellerRatingProps {
  rating?: number; // 0–5 scale
}

export default function SellerRating({ rating = 0 }: SellerRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const fillClass =
          rating >= star
            ? "text-yellow-500 fill-yellow-500" // full star
            : rating >= star - 0.5
            ? "text-yellow-400 fill-yellow-300" // half-filled star
            : "text-gray-300"; // empty star

        return <Star
                key={star}
                size={12}
                className={`${fillClass} transition-all duration-300`}
              />;
      })}

      <span className="ml-2 text-sm font-medium text-gray-700">
        {rating > 0 ? rating.toFixed(1) : "New"}
      </span>
    </div>
  );
}
