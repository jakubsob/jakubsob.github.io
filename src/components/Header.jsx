export default function Header({ children }) {
  return (
    <div
      id="header"
      className="fixed top-0 z-10 h-12 w-full
    text-black transition-all duration-500"
    >
      <header
        className="max-w-[65ch]
        mx-auto mt-2
        px-4 py-4
        shadow-md
        bg-gradient-to-r from-sky-100/10 to-sky-100/20
        backdrop-blur-md
        tracking-wider
        rounded-lg"
      >
        <nav className="flex flex-row gap-4 items-center justify-start">
          {children}
        </nav>
      </header>
    </div>
  );
}
