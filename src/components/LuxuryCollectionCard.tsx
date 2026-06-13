"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CollectionItem } from "@/types";

type LuxuryCollectionCardProps = {
  collection: CollectionItem;
  index?: number;
};

export default function LuxuryCollectionCard({
  collection,
  index = 0,
}: LuxuryCollectionCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="luxury-collection-card group relative h-[120px] sm:h-[125px] md:h-[130px] overflow-hidden rounded-[20px] border border-[#E8DCCB]/60 bg-[#FDFBF7] shadow-[0_8px_30px_rgba(87,61,28,0.03)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(120,83,35,0.08)] w-full flex flex-row cursor-pointer"
    >
      {/* Left Side: Thumbnail Image with gradient mask fade */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[42%] overflow-hidden z-0 rounded-l-[20px]"
        style={{
          maskImage: "linear-gradient(to right, black 0%, rgba(0, 0, 0, 0.9) 40%, rgba(0, 0, 0, 0.15) 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, black 0%, rgba(0, 0, 0, 0.9) 40%, rgba(0, 0, 0, 0.15) 75%, transparent 100%)",
        }}
      >
        <Image
          src={collection.image}
          alt={collection.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
        />
      </div>

      {/* Right Side: Text info */}
      <div className="relative z-10 w-full pl-[40%] pr-4 py-3 h-full flex flex-col justify-center text-left">
        <div>
          <h3 className="heading-font text-[14px] sm:text-[15px] font-bold text-[#B88746] group-hover:text-[#A97432] transition-colors leading-tight line-clamp-1">
            {collection.title}
          </h3>
          <p className="text-[11px] sm:text-[12px] text-[#6F665C] mt-1 leading-normal line-clamp-2">
            {collection.description}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-[#B88746] group-hover:text-[#A97432] mt-2.5 transition-colors">
          <span>Khám phá</span>
          <ArrowRight
            size={11}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </motion.article>
  );
}
