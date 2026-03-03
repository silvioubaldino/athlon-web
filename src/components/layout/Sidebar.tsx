'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Image,
  Tag,
  Database,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Zap,
  Users,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavChild {
  label: string
  href:  string
}

interface NavItem {
  label:     string
  href?:     string
  icon:      React.ElementType
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { label: 'Biblioteca',    href: '/library',        icon: Image },
  { label: 'Classificação', href: '/classification', icon: Tag   },
  {
    label: 'Vocabulários',
    icon:  Database,
    children: [
      { label: 'Projetos',        href: '/vocabularies/projects'        },
      { label: 'Modalidades',     href: '/vocabularies/sports'          },
      { label: 'Atletas',         href: '/vocabularies/athletes'        },
      { label: 'Eventos',         href: '/vocabularies/events'          },
      { label: 'Fontes de Renda', href: '/vocabularies/funding-sources' },
    ],
  },
]

const childIcons: Record<string, React.ElementType> = {
  '/vocabularies/projects':        Briefcase,
  '/vocabularies/sports':          Zap,
  '/vocabularies/athletes':        Users,
  '/vocabularies/events':          Calendar,
  '/vocabularies/funding-sources': DollarSign,
}

interface SidebarProps {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname()
  const [vocabOpen, setVocabOpen] = useState(
    pathname.startsWith('/vocabularies')
  )

  return (
    <aside
      className={cn(
        'h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-200 shrink-0',
        collapsed ? 'w-12' : 'w-60'
      )}
    >
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          if (item.children) {
            const isActive = pathname.startsWith('/vocabularies')
            return (
              <div key={item.label}>
                <button
                  onClick={() => !collapsed && setVocabOpen((v) => !v)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg mx-1 transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {vocabOpen
                        ? <ChevronDown size={14} />
                        : <ChevronRight size={14} />
                      }
                    </>
                  )}
                </button>

                {!collapsed && vocabOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.children.map((child) => {
                      const ChildIcon = childIcons[child.href] ?? Database
                      const isChildActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors',
                            isChildActive
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          <ChildIcon size={14} className="shrink-0" />
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg mx-1 transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
