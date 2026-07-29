"use client";

import type { ProjectDetail } from "@/types/project-detail";
import ProjectImageGallery from "@/components/project-detail/ProjectImageGallery";
import { ProjectSectionTitle, ProjectSupportingText } from "@/components/project-detail/ProjectTypography";

type Props = { project: ProjectDetail };

export default function ProjectGalleryAlbumSection({ project }: Props) {
  if (!project.detailGallery.images.length) return null;

  const title = project.detailGallery.title || "Album ảnh dự án";
  return (
    <section className="rounded-[24px] border border-line/80 bg-white p-4 shadow-soft sm:p-6 lg:p-8">
      <div className="mb-5 text-left">
        {project.detailGallery.label ? <p className="text-[11px] font-bold tracking-[0.16em] text-gold normal-case">{project.detailGallery.label}</p> : null}
        <ProjectSectionTitle className="mt-2 normal-case">{title}</ProjectSectionTitle>
        <ProjectSupportingText className="mt-3 max-w-2xl text-muted">
          {project.detailGallery.description || "Khám phá hình ảnh thực tế, tiện ích, cảnh quan và những góc nhìn nổi bật của dự án."}
        </ProjectSupportingText>
      </div>
      <ProjectImageGallery images={project.detailGallery.images} title={title} altPrefix={`${title} — ${project.name}`} />
    </section>
  );
}
