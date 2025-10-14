import type { ReactNode } from 'react';
import { useSidebar } from '../contexts/SidebarContext';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { isOpen } = useSidebar();

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Sidebar */}
            <Sidebar />

            {/* Contenido Principal */}
            <div className={`
        flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? 'lg:ml-64' : 'lg:ml-16'}
      `}>
                {children}
            </div>
        </div>
    );
}
