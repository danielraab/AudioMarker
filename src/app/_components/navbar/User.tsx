"use client";

import {
  NavbarContent,
  NavbarItem} from "@heroui/navbar";
import { Avatar } from "@heroui/avatar";
import {  
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { User, LogIn, LogOut, Settings } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();

  return (
      <NavbarContent as="div" justify="end" className="grow-0">
        <NavbarItem>
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-default-200" />
          ) : session?.user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  src={session.user.image ?? undefined}
                  name={session.user.name ?? session.user.email ?? "User"}
                  size="sm"
                  className="transition-transform hover:scale-105"
                  radius="full"
                  fallback={<User className="h-4 w-4" />}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{session.user.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  startContent={<Settings className="h-4 w-4" />}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<LogOut className="h-4 w-4" />}
                  onPress={() => signOut()}
                >
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  size="sm"
                  className="transition-transform hover:scale-105"
                  radius="full"
                  fallback={<User className="h-4 w-4" />}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Auth menu">
                <DropdownItem
                  key="signin"
                  startContent={<LogIn className="h-4 w-4" />}
                  onPress={() => signIn()}
                >
                  Sign In
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </NavbarItem>
      </NavbarContent>
  );
}