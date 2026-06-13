"use client";

import React from "react";
import Link from "next/link";
import clsx from "clsx";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost" | "gold-gradient";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
};

export default function Button({
  children,
  variant = "solid",
  size = "md",
  href,
  className,
  onClick,
  type = "button",
  icon,
  iconPosition = "right",
  disabled,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-[4px] transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-gold/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group";

  const sizeClasses = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-5 py-2 text-xs sm:px-6 sm:py-2.5 sm:text-sm",
    lg: "px-7 py-3 text-sm sm:px-8 sm:py-3 sm:text-sm",
  };

  const variantClasses = {
    solid:
      "bg-gold text-white hover:bg-gold-dark shadow-sm hover:shadow-soft active:translate-y-0",
    "gold-gradient":
      "bg-gradient-to-r from-gold via-gold-light to-gold-dark text-white hover:opacity-95 shadow-sm hover:shadow-soft active:translate-y-0",
    outline:
      "border border-gold text-gold hover:bg-gold hover:text-white active:translate-y-0",
    ghost: "text-ink hover:bg-beige/40 active:scale-98",
  };

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span className="mr-2.5 transition-transform duration-300 group-hover:-translate-x-[2px] inline-flex">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="ml-2.5 transition-transform duration-300 group-hover:translate-x-[4px] inline-flex">
          {icon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={clsx(baseClasses, sizeClasses[size], variantClasses[variant], className)}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={clsx(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
