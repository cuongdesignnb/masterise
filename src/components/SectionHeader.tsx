import React from "react";
import clsx from "clsx";

export default function SectionHeader({
  title,
  subtitle,
  description,
  align = "center",
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "mb-10 sm:mb-12 flex flex-col gap-4",
        align === "center" && "text-center items-center justify-center",
        align === "left" && "sm:flex-row sm:items-end sm:justify-between text-left",
        align === "right" && "sm:flex-row sm:items-end sm:justify-between text-right",
        className
      )}
    >
      <div className={clsx("max-w-2xl", align === "center" && "mx-auto")}>
        {subtitle && (
          <span className="text-xs sm:text-sm font-semibold text-gold tracking-widest uppercase block mb-2">
            {subtitle}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl heading-font font-medium text-ink leading-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex-shrink-0 self-start sm:self-end">{children}</div>}
    </div>
  );
}
