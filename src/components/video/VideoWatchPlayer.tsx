import type { ProjectVideo } from "@/lib/video/projectVideo";

interface VideoWatchPlayerProps {
  video: ProjectVideo;
}

export default function VideoWatchPlayer({ video }: VideoWatchPlayerProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-line/80 bg-black shadow-[0_24px_70px_rgba(31,27,22,.18)]">
      <iframe
        src={video.parsed.embedUrl}
        title={video.title}
        className="aspect-video h-auto w-full"
        loading="eager"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
