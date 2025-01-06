const PillButton = ({
  isActive = false,
  onClick = () => {},
  className = "",
  href,
  children,
}) => {
  const baseClasses = `px-2 py-0 rounded-lg space-x-1 transition-all hover:bg-gray-200 hover:text-black ${
    isActive ? "bg-gray-300" : "bg-transparent"
  } ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={
          baseClasses + " no-underline border border-1 border-gray-300"
        }
      >
        {children}
      </a>
    );
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export default PillButton;
