"use client";

import React from "react";
import { motion } from "framer-motion";
import { amenities } from "@/data/seed";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import MotionWrapper from "./MotionWrapper";

export default function LifestyleAmenities() {
  return (
    <section className="py-16 sm:py-20 bg-ivory">
      <Container>
        <MotionWrapper>
          <SectionHeader
            title="TIỆN ÍCH & PHONG CÁCH SỐNG"
            subtitle="ĐẶC QUYỀN THƯỢNG LƯU"
            description="Tận hưởng không gian sống đẳng cấp với hệ sinh thái tiện ích toàn diện được thiết kế chuyên biệt cho cộng đồng cư dân tinh hoa."
          />
        </MotionWrapper>

        {/* Amenities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {amenities.map((amenity, idx) => (
            <MotionWrapper key={amenity.id} delay={idx * 0.05} className="h-full">
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden group cursor-pointer shadow-soft border border-line/45">
                {/* Amenity Image */}
                <img
                  src={amenity.image}
                  alt={amenity.title}
                  className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-108"
                />

                {/* Soft Gold/Black Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-gold-dark/90 group-hover:via-gold/40 group-hover:to-transparent transition-all duration-500" />

                {/* Content info */}
                <div className="absolute bottom-5 left-4 right-4 text-center sm:text-left z-10">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide heading-font leading-snug drop-shadow-md">
                    {amenity.title}
                  </h3>
                  <div className="w-6 h-[1.5px] bg-gold-light mt-2 group-hover:w-12 transition-all duration-300 mx-auto sm:mx-0" />
                </div>
              </div>
            </MotionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
