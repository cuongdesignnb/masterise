"use client";

import { CheckCircle2, HardHat } from "lucide-react";
import { useState } from "react";
import ProjectImageGallery from "@/components/project-detail/ProjectImageGallery";
import { ProjectSectionTitle, ProjectSupportingText } from "@/components/project-detail/ProjectTypography";
import type { ProjectDetail } from "@/types/project-detail";

type Props = { project: ProjectDetail };

export default function ProjectTimelineGallerySection({ project }: Props) {
  const [activeIndex, setActiveIndex] = useState(project.timeline.length - 1);
  if (!project.timeline.length) return null;

  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), project.timeline.length - 1);
  const activeItem = project.timeline[safeActiveIndex];
  const sectionTitle = project.sectionTitles?.timeline;
  const panelId = `project-timeline-panel-${activeItem.key}`;

  return (
    <section id="tien-do" className="scroll-mt-32 py-2" aria-labelledby="project-timeline-heading">
      <div className="mb-8">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-gold">{sectionTitle?.eyebrow || "CẬP NHẬT DỰ ÁN"}</p>
          <ProjectSectionTitle id="project-timeline-heading" className="mt-2 normal-case">{sectionTitle?.title || "Tiến độ thi công"}</ProjectSectionTitle>
          <ProjectSupportingText className="mt-3 text-muted">Cập nhật các mốc thi công và hình ảnh thực tế mới nhất của dự án.</ProjectSupportingText>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0" role="tablist" aria-label="Các mốc tiến độ thi công">
        <div className="relative flex min-w-max items-start px-1 pt-2">
          <div className="absolute left-[92px] right-[92px] top-[20px] h-px bg-[#dfc89e]" aria-hidden="true" />
          {project.timeline.map((item, index) => {
            const active = index === safeActiveIndex;
            const latest = index === project.timeline.length - 1;
            return (
              <button
                key={item.key}
                id={`timeline-tab-${item.key}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`project-timeline-panel-${item.key}`}
                onClick={() => setActiveIndex(index)}
                className="group relative z-10 w-[180px] shrink-0 px-3 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4"
              >
                <span className={`mx-auto block h-6 w-6 rounded-full border-[2px] bg-ivory transition ${active ? "border-gold shadow-[0_0_0_5px_rgba(184,135,70,.16)]" : "border-[#dfc89e] group-hover:border-gold"}`}>
                  {active ? <span className="m-[3px] block h-3 w-3 rounded-full bg-gold" /> : null}
                </span>
                <span className={`mt-3 block text-sm ${active ? "font-bold text-ink" : "font-medium text-muted"}`}>{item.date}</span>
                <span className={`mx-auto mt-1 line-clamp-2 block max-w-[160px] text-sm leading-5 ${active ? "font-semibold text-ink" : "text-muted"}`}>{item.title}</span>
                {latest ? <span className="mt-2 inline-flex rounded-md border border-gold/35 bg-[#fff9ef] px-2 py-1 text-[10px] font-bold text-gold-dark">Mới nhất</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={`timeline-tab-${activeItem.key}`} className="mt-3 grid overflow-hidden rounded-[20px] border border-line/80 bg-white shadow-soft lg:grid-cols-[minmax(260px,0.32fr)_minmax(0,0.68fr)]">
        <div className="flex flex-col border-b border-line/70 p-5 sm:p-7 lg:border-b-0 lg:border-r lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold-dark">{activeItem.date}</p>
            {safeActiveIndex === project.timeline.length - 1 ? <span className="rounded-md border border-gold/35 bg-[#fff9ef] px-3 py-1 text-[10px] font-bold text-gold-dark">Mới nhất</span> : null}
          </div>
          <h3 className="heading-font mt-5 text-[26px] font-semibold leading-[1.2] text-ink sm:text-[30px]">{activeItem.title}</h3>
          {activeItem.description ? <p className="project-supporting-text mt-4 whitespace-pre-line text-muted">{activeItem.description}</p> : null}
          {activeItem.bullets.length ? (
            <ul className="mt-5 space-y-3">
              {activeItem.bullets.map((bullet, index) => (
                <li key={`${bullet}-${index}`} className="flex gap-3 text-sm leading-6 text-muted">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-auto flex items-center gap-3 border-t border-line/70 pt-6 text-sm text-muted">
            <HardHat className="h-6 w-6 text-gold" aria-hidden="true" />
            <span>{activeItem.images.length} hình ảnh thực tế</span>
          </div>
        </div>

        <div className="min-w-0 p-3 sm:p-4">
          <ProjectImageGallery
            key={activeItem.key}
            images={activeItem.images}
            title={`Tiến độ thi công ${activeItem.date}`}
            altPrefix={`Tiến độ ${project.name} — ${activeItem.date} — ${activeItem.title}`}
            caption={`Tiến độ thi công ${activeItem.date}`}
            compact
            showFooter
            visibleLimit={4}
          />
        </div>
      </div>
    </section>
  );
}
