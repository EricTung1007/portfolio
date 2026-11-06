import { useState } from 'react';

interface ProjectCardProps {
  title: string;
  year?: string;
  description: string[];
  stack: string[];
  link: string;
}

export default function ProjectCard({ title, year, description, stack, link }: ProjectCardProps) {
  return (
    <div className="card-interactive space-y-3">
      <div className="flex items-baseline gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {year && <span className="text-sm text-[var(--muted)]">{year}</span>}
      </div>
      <ul className="space-y-1 text-sm text-slate-300 list-disc list-inside">
        {description.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {stack.map((s, i) => (
          <span key={i} className="chip-soft text-xs">{s}</span>
        ))}
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-[var(--accent)] hover:text-[#ff7282]">
        View source →
      </a>
    </div>
  );
}
