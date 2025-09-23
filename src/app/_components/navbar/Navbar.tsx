"use client";

import {
  Navbar as HeroNavbar,
  NavbarBrand
} from "@heroui/navbar";
import UserMenu from "./User";
import Link from "next/link";

interface NavbarProps {
  title?: string;
  logoSrc?: string;
}

export default function Navbar({ title = "Audio Marker", logoSrc }: NavbarProps) {

  return (
    <HeroNavbar isBordered>
      {/* Left side - Logo */}
      <NavbarBrand className="grow-0">
        <Link href="/" className="flex items-center gap-2">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <img
              src="/audio-marker-logo.svg"
              alt="Audio Marker Logo"
              className="h-8 w-8 object-contain transition-transform hover:scale-105"
            />
          )}
          <span className="font-bold text-inherit">Audio Marker</span>
        </Link>
      </NavbarBrand>

      <UserMenu />
    </HeroNavbar>
  );
}