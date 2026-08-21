import { Separator } from "@workspace/ui/components/separator"
import { LogoMark } from "@/assets/icons/logo-mark"
import { FOOTER_LINKS } from "@/lib/landing-data"

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1280px] px-6 py-12">
      <Separator className="mb-8" />
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="size-6" />
          <span className="font-heading text-sm text-foreground">4 in a Row</span>
          <span className="text-sm text-muted-foreground">— Connect Four, live.</span>
        </div>

        <nav className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
