'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    Tags,
    ArrowRightLeft,
    LogOut,
    Menu,
    X,
    HardHat,
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Obras', icon: Building2 },
    { href: '/categories', label: 'Categorias', icon: Tags },
    { href: '/transactions', label: 'Lançamentos', icon: ArrowRightLeft },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-md md:hidden"
                style={{ background: '#fbfbfa', border: '1px solid #ebebea' }}
            >
                {isOpen ? <X size={18} color="#37352f" /> : <Menu size={18} color="#37352f" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''} md:translate-x-0`}>
                {/* Logo */}
                <div style={{ padding: '4px 10px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HardHat size={18} color="#37352f" />
                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#37352f' }}>
                            Controladoria
                        </span>
                    </div>
                </div>

                {/* Section label */}
                <div style={{ padding: '4px 10px 4px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#9b9a97', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Menu
                    </span>
                </div>

                {/* Nav Links */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/'
                                ? pathname === '/'
                                : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                <Icon size={16} color={isActive ? '#37352f' : '#9b9a97'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ position: 'absolute', bottom: '16px', left: '8px', right: '8px' }}>
                    <button
                        onClick={handleLogout}
                        className="sidebar-link"
                        style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#9b9a97', fontSize: '13px' }}
                    >
                        <LogOut size={15} />
                        Sair
                    </button>
                </div>
            </aside>
        </>
    );
}
