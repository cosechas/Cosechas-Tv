"use client"

import {
  ChevronsUpDown,
  CreditCard,
  UserCog,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import BoringAvatar from "boring-avatars";
import { UserManagementDialog } from "./user-management-dialog";

export function NavUser() {
  const { isMobile } = useSidebar()
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario',
          email: data.user.email || '',
          avatar: data.user.user_metadata?.avatar_url || '',
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (!user) return <div className="p-4 text-xs text-red-500">No hay usuario autenticado</div>;

  return (
    <>
      <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="h-8 w-8 rounded-sm overflow-hidden flex items-center justify-center bg-muted">
                <BoringAvatar
                  size={32}
                  name={user.email || user.name}
                  variant="beam"
                  colors={["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"]}
                  square
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="h-8 w-8 rounded-sm overflow-hidden flex items-center justify-center bg-muted">
                  <BoringAvatar
                    size={32}
                    name={user.email || user.name}
                    variant="beam"
                    colors={["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"]}
                    square
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setShowUserManagement(true)}>
                <UserCog />
                Configuracion
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuGroup>  
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon />
                Oscuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun />
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor />
                Sistema
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    <UserManagementDialog open={showUserManagement} onOpenChange={setShowUserManagement} />
    </>
  )
}
