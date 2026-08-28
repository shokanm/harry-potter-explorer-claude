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
    <header className="ink-in">
      {kicker && <p className="kicker">{kicker}</p>}
      <h1 className="rule mt-2 text-3xl sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-2xl text-muted">{subtitle}</p>}
      {children}
    </header>
  );
}
