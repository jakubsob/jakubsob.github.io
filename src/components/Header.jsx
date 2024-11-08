import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Header({ children }) {
  useEffect(() => {
    gsap.from("#header", {
      scrollTrigger: {
        trigger: "#blog",
        start: "top bottom",
        end: "top top",
        scrub: true,
        toggleActions: "play none none reverse",
      },
      color: "var(--color-gray-300)",
    });
  }, []);

  return (
    <div
      id="header"
      className="w-full fixed top-0 z-10 h-12 backdrop-blur-sm text-black"
    >
      <header className="max-w-[65ch] mx-auto px-2 py-2 tracking-wider">
        <nav className="flex flex-row items-center justify-start">
          {children}
        </nav>
      </header>
    </div>
  );
}
