interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export default function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="app">
      <header className="app-head">
        <h1 className="app-name">{title}</h1>
      </header>
      <main className="app-body">{children}</main>
    </div>
  );
}
