import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  variant?: "light" | "dark" | "white"
  className?: string
  alt?: string
}

const LOGO_SOURCES: Record<NonNullable<BrandLogoProps["variant"]>, { src: string }> = {
  light: { src: "/images/logo_new_2.png" },
  white: { src: "/images/logo_new_1.png" },
  dark: { src: "/images/logo_new_3.png" },
}

export function BrandLogo({
  variant = "light",
  className,
  alt = "Batangas Heritage logo",
}: BrandLogoProps) {
  const { src } = LOGO_SOURCES[variant]

  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className={cn("object-contain", className ?? "size-8")}
    />
  )
}
