'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Globe, 
  Users,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/AuthStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Requests', href: '/requests', icon: FileText },
  { name: 'Websites', href: '/websites', icon: Globe },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Issues', href: '/issues', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setCollapsed(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 64 : 256,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen bg-black border-r border-white/10 z-30 lg:relative"
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <img
                  src="/agency_logo.png"
                  alt="dev365"
                  className="h-8 sm:h-10 w-auto"
                />
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative mx-auto"
              >
                <img src="/agency_logo.png" alt="dev365" className="h-6 w-10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    // Don't auto-collapse on mobile since it's always collapsed
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer group relative overflow-hidden justify-center lg:justify-start",
                    collapsed ? "justify-center" : "",
                    isActive
                      ? "bg-white text-black"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBackground"
                      className="absolute inset-0 bg-white rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={{
                      rotate: isActive ? [0, -10, 10, -10, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-black" : ""
                      )}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm truncate relative z-10"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {!collapsed && isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="ml-auto h-2 w-2 rounded-full bg-black flex-shrink-0 relative z-10"
                      />
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-16 left-0 right-0 p-2">
          <motion.button
            whileHover={{ scale: 1.02, x: collapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer group relative overflow-hidden justify-center lg:justify-start",
              collapsed ? "justify-center" : "",
              "text-red-400 hover:text-red-300 hover:bg-red-500/10"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 relative z-10" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium text-sm truncate relative z-10"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Footer */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10"
            >
              <div className="text-xs text-white/40 text-center">
                © 2026 dev365. All rights reserved.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}