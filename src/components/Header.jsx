export default function Header({ children }) {
  return (
    <div
      id="header"
      className="w-full fixed top-0 z-10 h-12 backdrop-blur-sm text-black"
    >
      <header className="max-w-[65ch] mx-auto px-2 py-2 tracking-wider">
        <nav className="flex flex-row gap-4 items-center justify-start">
          {children}
        </nav>
      </header>
    </div>
  );
}
