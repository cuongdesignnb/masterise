"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart, MapPin } from "lucide-react";
import type { Project } from "@/types";
import { useState } from "react";

type HotProjectCardProps = {
  project: Project;
  index?: number;
};

function getBadgeClass(badge?: string) {
  if (badge === "HOT") return "bg-[#EF4444] text-white";
  if (badge === "Best Seller") return "bg-[#D89B2B] text-white";
  if (badge === "Sắp mở bán") return "bg-[#17823B] text-white";
  return "bg-[#B88746] text-white";
}

export default function HotProjectCard({
  project,
  index = 0,
}: HotProjectCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="hot-project-card group relative h-[220px] overflow-hidden rounded-[22px] border border-[#E8DCCB]/80 bg-white shadow-[0_16px_42px_rgba(87,61,28,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(120,83,35,0.14)] md:h-[230px] w-full"
    >
      <Image
        src={project.image}
        alt={project.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        className="object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-105"
      />

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/0 via-black/0 to-black/15" />

      {project.badge ? (
        <div
          className={[
            "absolute left-4 top-4 z-30 rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.09em] shadow-sm",
            getBadgeClass(project.badge),
          ].join(" ")}
        >
          {project.badge}
        </div>
      ) : null}

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsSaved(!isSaved);
        }}
        aria-label="Lưu dự án yêu thích"
        className={`absolute right-4 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow-sm border border-white/10 ${
          isSaved 
            ? "bg-white text-[#EF4444]" 
            : "bg-white/20 text-white hover:bg-white hover:text-[#B88746]"
        }`}
      >
        <Heart size={15} className={isSaved ? "fill-current" : ""} />
      </button>

      <motion.div
        initial={{ x: "-8%", opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.58,
          delay: 0.12 + index * 0.04,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="hot-project-glass absolute bottom-4 left-4 right-4 z-20 overflow-hidden rounded-[16px] px-4 py-3.5"
      >
        <div className="relative z-10 grid grid-cols-[1fr_auto] items-center gap-3">
          <div className="min-w-0">
            <h3 className="text-[14px] sm:text-[15px] font-bold leading-tight tracking-tight text-[#1F1B16] truncate">
              {project.name}
            </h3>

            <div className="mt-1.5 flex min-w-0 items-center gap-1 text-[11px] font-medium text-[#6F665C] md:text-[12px]">
              <MapPin size={12} className="shrink-0 text-[#B88746]" />
              <span className="truncate">{project.location}</span>
            </div>

            <p className="mt-2.5 whitespace-nowrap text-[12px] font-extrabold leading-none text-[#A97432] md:text-[13px]">
              {project.price}
            </p>
          </div>

          <Link
            href={project.slug ? `/${project.slug}` : `#project-${project.id}`}
            aria-label="Xem chi tiết dự án"
            className="group/btn flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E8DCCB] bg-white/70 text-[#B88746] shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#B88746] hover:bg-[#B88746] hover:text-white"
          >
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
            />
          </Link>
        </div>
      </motion.div>
    </motion.article>
  );
}
