import { useState } from "react";
import { Menu } from "lucide-react";
import { getTooltipMessage } from "./HoverTooltip";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

interface TopRightNavProps {
  setTooltipText: (text: string) => void;
}

// TopRightNav: Fixed quick navigation for key destinations.
export function TopRightNav({ setTooltipText }: TopRightNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/products", label: "Products" },
    { href: "https://metis.zward.studio/", label: "Metis", external: true },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <nav
      data-ui="top-right-nav"
      className="fixed right-2 top-4 z-50 rounded-full border border-border/80 bg-background/85 px-3 py-2 shadow-sm backdrop-blur sm:right-4 sm:top-6"
    >
      <ul className="hidden items-center gap-2 sm:gap-3 lg:flex">
        {navLinks.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="rounded-md px-2 py-1 text-xs text-foreground transition-colors hover:bg-accent sm:text-sm"
              onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
              onMouseLeave={() => setTooltipText("")}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="lg:hidden">
        <Drawer direction="right" open={mobileOpen} onOpenChange={setMobileOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:px-4 sm:py-2.5 sm:text-base"
              aria-label="Open navigation menu"
            >
              <span className="inline-flex items-center gap-1.5">
                <Menu className="h-5 w-5" />
                <span>Menu</span>
              </span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="h-full w-full border-l-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-none">
            <DrawerHeader className="border-b border-border pt-8">
              <DrawerTitle>Navigation</DrawerTitle>
            </DrawerHeader>
            <div className="flex h-full flex-col gap-4 p-5 pt-6">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="rounded-[999px] border border-border bg-background px-6 py-4 text-center text-base font-medium text-foreground transition-colors hover:bg-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}
