import type { ComponentPropsWithoutRef, ReactNode } from "react";

type HeadingProps = ComponentPropsWithoutRef<"h1"> & { children: ReactNode };
type ParagraphProps = ComponentPropsWithoutRef<"p"> & { children: ReactNode };

function mergeClasses(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

export function ProjectPageTitle({ className, ...props }: HeadingProps) {
  return <h1 {...props} className={mergeClasses("project-display-title heading-font", className)} />;
}

export function ProjectSectionTitle({ className, ...props }: HeadingProps) {
  return <h2 {...props} className={mergeClasses("project-section-title heading-font", className)} />;
}

export function ProjectSubsectionTitle({ className, ...props }: HeadingProps) {
  return <h3 {...props} className={mergeClasses("project-subsection-title heading-font", className)} />;
}

export function ProjectCardTitle({ className, ...props }: HeadingProps) {
  return <h4 {...props} className={mergeClasses("project-card-title heading-font", className)} />;
}

export function ProjectBody({ className, ...props }: ParagraphProps) {
  return <p {...props} className={mergeClasses("project-body", className)} />;
}

export function ProjectSupportingText({ className, ...props }: ParagraphProps) {
  return <p {...props} className={mergeClasses("project-supporting-text", className)} />;
}

export function ProjectMetaText({ className, ...props }: ParagraphProps) {
  return <p {...props} className={mergeClasses("project-meta-text", className)} />;
}
