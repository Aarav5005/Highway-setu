'use client';

export function Header() {
  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0">
      <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-700">Admin User</p>
          <p className="text-xs text-slate-500">admin@highwaysetu.com</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>
    </header>
  );
}
