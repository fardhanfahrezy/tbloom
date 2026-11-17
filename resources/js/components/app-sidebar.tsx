import { Link, usePage } from '@inertiajs/react';
import {
    Cake,
    CalendarClock,
    FolderTree,
    LayoutGrid,
    SlidersHorizontal,
    Store,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, home } from '@/routes';
import admin from '@/routes/admin';
import owner from '@/routes/owner';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role;

    const mainNavItems: NavItem[] =
        role === 'owner'
            ? [
                  {
                      title: 'Dashboard Owner',
                      href: owner.dashboard(),
                      icon: LayoutGrid,
                  },
                  {
                      title: 'Kelola Admin',
                      href: owner.admins.index(),
                      icon: Users,
                  },
                  {
                      title: 'Katalog Publik',
                      href: home(),
                      icon: Store,
                  },
              ]
            : role === 'admin'
              ? [
                    {
                        title: 'Dashboard Admin',
                        href: admin.dashboard(),
                        icon: LayoutGrid,
                    },
                    {
                        title: 'Kategori Kue',
                        href: admin.categories.index(),
                        icon: FolderTree,
                    },
                    {
                        title: 'Katalog Kue',
                        href: admin.cakes.index(),
                        icon: Cake,
                    },
                    {
                        title: 'Opsi Kue',
                        href: admin.options.index(),
                        icon: SlidersHorizontal,
                    },
                    {
                        title: 'Kapasitas & Slot',
                        href: admin.capacities.index(),
                        icon: CalendarClock,
                    },
                    {
                        title: 'Katalog Publik',
                        href: home(),
                        icon: Store,
                    },
                ]
              : [
                    {
                        title: 'Katalog Kue',
                        href: home(),
                        icon: Store,
                    },
                ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
