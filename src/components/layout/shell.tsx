'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger
} from '@/components/ui/sheet'
import { 
  Menu,
  Home,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface ShellProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Voorraad', href: '/inventory', icon: Package },
  { name: 'Instellingen', href: '/settings', icon: Settings },
]

export function Shell({ children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="h-screen flex">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-slate-700">
          <div className="border-b border-slate-700 p-4">
            <Link href="/" className="block">
              <img 
                src="/logo.png" 
                alt="Stock2Coat" 
                width={180} 
                height={48} 
                className="h-12 w-auto object-contain" 
                style={{ display: 'block', maxWidth: '180px', height: '48px' }}
              />
            </Link>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                        isActive
                          ? "bg-slate-700 text-sky-400"
                          : "text-slate-100 hover:text-white hover:bg-slate-700"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden md:flex flex-col bg-slate-900 border-r border-slate-700 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-slate-700">
          {!sidebarCollapsed && (
            <div className="p-4">
              <Link href="/" className="block">
                <img 
                  src="/logo.png" 
                  alt="Stock2Coat" 
                  width={180} 
                  height={48} 
                  className="h-12 w-auto object-contain" 
                  style={{ display: 'block', maxWidth: '180px', height: '48px' }}
                />
              </Link>
            </div>
          )}
          <div className="p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 text-slate-100 hover:text-white hover:bg-slate-700"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                      sidebarCollapsed && "justify-center",
                      isActive
                        ? "bg-slate-700 text-sky-400"
                        : "text-slate-100 hover:text-white hover:bg-slate-700"
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-slate-700">
          <div className={cn(
            "flex items-center gap-3 text-sm text-slate-100",
            sidebarCollapsed && "justify-center"
          )}>
            <div className="h-8 w-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              S
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium text-slate-100">Strameco</p>
                <p className="text-xs text-slate-400">Pilot klant</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 ml-12 md:ml-0">
                {navigation.find(nav => nav.href === pathname)?.name || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 h-full overflow-auto bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  )
}