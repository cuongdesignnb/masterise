"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { luxuryCollections } from "@/data/seed";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import MotionWrapper from "./MotionWrapper";
import LuxuryCollectionCard from "./LuxuryCollectionCard";

export default function LuxuryCollections() {
  return (
    <section id="bo-suu-tap" className="py-14 md:py-18 bg-[#FFFDF8] border-t border-line/30">
      <Container>
        <MotionWrapper>
          {/* Header Section styled cleanly matching the mockup */}
          <SectionHeader
            title="BỘ SƯU TẬP BẤT ĐỘNG SẢN HẠNG SANG"
            align="left"
            className="mb-8"
          >
            <Link
              href="#bo-suu-tap-tat-ca"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gold hover:text-gold-dark transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight 
                size={14} 
                className="transition-transform duration-300 group-hover:translate-x-1" 
              />
            </Link>
          </SectionHeader>
        </MotionWrapper>

        {/* Collections Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
          {luxuryCollections.map((collection, index) => (
            <LuxuryCollectionCard
              key={collection.id}
              collection={collection}
              index={index}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
