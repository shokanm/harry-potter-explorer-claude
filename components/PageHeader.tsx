export function PageHeader({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="press-in">
      {kicker && <p className="kicker">{kicker}</p>}
      <h1 className="rule-hair mt-2 text-4xl sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-soft">{subtitle}</p>}
      {children}
    </header>
  );
}
