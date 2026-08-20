import { Button } from "@workspace/ui/components/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@workspace/ui/components/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet"
import { Menu } from "@workspace/ui/icons"
import { LogoMark } from "@/assets/icons/logo-mark"
import { PlayNowButton } from "@/components/shared/PlayNowButton"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2">
          <LogoMark className="size-8" />
          <span className="font-heading text-lg text-foreground">4 in a Row</span>
        </a>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-6">
            {[
              { label: "How to Play", href: "#how-to-play" },
              { label: "Leaderboard", href: "#leaderboard" },
            ].map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <PlayNowButton />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6 p-6">
              <nav className="flex flex-col gap-4">
                {[
                  { label: "How to Play", href: "#how-to-play" },
                  { label: "Leaderboard", href: "#leaderboard" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <PlayNowButton className="w-full" />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
