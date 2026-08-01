import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  variant?: "light" | "dark" | "white"
  className?: string
  alt?: string
}

const LOGO_SOURCES: Record<NonNullable<BrandLogoProps["variant"]>, { src: string; width: number; height: number }> = {
  light: { src: "/images/logo_new_2.png", width: 1873, height: 1914 },
  white: { src: "/images/logo_new_1.png", width: 1873, height: 1914 },
  dark: { src: "/images/logo_new_3.png", width: 1873, height: 1914 },
}

export function BrandLogo({
  variant = "light",
  className,
  alt = "Batangas Heritage logo",
}: BrandLogoProps) {
  const { src, width, height } = LOGO_SOURCES[variant]

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={cn("object-contain", className ?? "size-8")}
    />
  )
}
