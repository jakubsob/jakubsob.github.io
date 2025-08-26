"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Menu, X, ChevronDown } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

type MenuItemType = {
  title: string;
  href?: string;
  description?: string;
  className?: string;
  items?: { title: string; href: string; description: string }[];
}

const menuItems: MenuItemType[] = [
  {
    title: "jakub::sobolewski",
    href: "/",
  },
  {
    title: "blog",
    href: "/blog/",
  },
  {
    title: "resources",
    items: [
      {
        title: "Learning resources",
        href: "/resources/",
        description: "Browse what helped me become a better engineer.",
      },
      {
        title: "Advance Your R Testing Roadmap",
        href: "/get-roadmap/",
        description: "Step-by-step guide to building better tests for R developers.",
      },
    ]
  },
  {
    title: "course",
    href: "/course/",
    className: "text-destructive",
  },
]

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setOpenDropdown(null) // Close any open dropdowns when toggling mobile menu
  }

  const toggleDropdown = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList>
            {menuItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                {item.items ? (
                  // Dropdown menu
                  <>
                    <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[600px]">
                        {item.items.map((subItem) => (
                          <ListItem
                            key={subItem.title}
                            title={subItem.title}
                            href={subItem.href}
                          >
                            {subItem.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  // Regular link
                  <NavigationMenuLink asChild>
                    <a
                      href={item.href}
                      className={cn(navigationMenuTriggerStyle(), item.className)}
                    >
                      {item.title}
                    </a>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full bg-background/95 backdrop-blur-sm border-b shadow-lg">
            <nav className="container mx-auto px-4 py-4">
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    {item.items ? (
                      // Mobile dropdown
                      <div>
                        <button
                          onClick={() => toggleDropdown(item.title)}
                          className="flex items-center justify-between w-full p-3 text-left rounded-md hover:bg-accent transition-colors"
                        >
                          <span className={cn("", item.className)}>
                            {item.title}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              openDropdown === item.title && "rotate-180"
                            )}
                          />
                        </button>
                        {openDropdown === item.title && (
                          <ul className="mt-2 ml-4 space-y-1">
                            {item.items.map((subItem) => (
                              <li key={subItem.title}>
                                <a
                                  href={subItem.href}
                                  className="block p-2 text-sm rounded-md hover:bg-accent transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <div className="">{subItem.title}</div>
                                  <div className="text-muted-foreground text-xs mt-1">
                                    {subItem.description}
                                  </div>
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      // Mobile regular link
                      <a
                        href={item.href}
                        className={cn(
                          "block p-3 rounded-md hover:bg-accent transition-colors",
                          item.className
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm leading-none text-foreground">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
