import { projects } from "@/lib/projects";

import { useRouter } from "next/navigation";

type Props = {
  project: string | null;
  onClose: () => void;
};

export default function ProjectPanel({ project, onClose }: Props) {
  if (!project) return null;

  const data = projects[project as keyof typeof projects];
  const router = useRouter();

  if (!data) return null;

  return (
  <>
    {/* Background overlay */}
    <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm backdrop-blur-sm z-40 pointer-events-auto"
        onClick={onClose}
    />

    {/* Side panel */}
    <div className="fixed top-0 right-0 h-full w-[420px] bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-[0_0_80px_rgba(168,85,247,0.15)] p-8 z-50 overflow-y-auto transition-transform duration-300 ease-out">
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white mb-4"
      >
        Close
      </button>

      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        {data.title}
      </h2>

      <p className="text-gray-400 text-sm mb-4">
        {data.description}
      </p>

      <ul className="space-y-2 text-sm text-gray-300 mb-6">
        {data.details.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>

      <a
        href={data.github}
        target="_blank"
        className="text-blue-400 hover:underline text-sm"
      >
        View on GitHub →
      </a>

      <button
        onClick={() => router.push(`/projects?node=${project}`)}
        className="mt-4 w-full px-4 py-2 rounded-lg border border-gray-700 hover:border-white transition hover:scale-105 active:scale-95"
      >
        Open in Projects
      </button>
    </div>
  </>
 );
}