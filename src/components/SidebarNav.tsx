import type { NavSection } from '../lib/nav';
import { NAV_ICONS } from '../lib/icons';

interface Props {
  sections: NavSection[];
  currentPath: string;
}

export default function SidebarNav({ sections, currentPath }: Props) {
  return (
    <nav className="flex flex-col gap-5">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-400">
            {section.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const Icon = NAV_ICONS[item.icon];
              const active = currentPath === item.href;
              return (
                <li key={item.id} className="relative">
                  {active && (
                    <span className="absolute inset-y-1.5 left-0 w-[3px] bg-cente-blue-600" />
                  )}
                  <a
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium text-ink-700 transition hover:bg-cente-blue-50 hover:text-cente-blue-600 aria-[current=page]:bg-cente-blue-50 aria-[current=page]:font-semibold aria-[current=page]:text-cente-blue-600 dark:text-ink-100 dark:hover:bg-ink-800 dark:aria-[current=page]:bg-ink-800"
                  >
                    {Icon && <Icon size={17} strokeWidth={1.75} />}
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
