const Topbar = () => (
  <header className="flex h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
    <input
      className="h-11 w-full max-w-3xl rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none focus:border-blue-400"
      type="text"
      placeholder="Search customers, medicines or invoices..."
    />
    <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900">Admin</div>
  </header>
)

export default Topbar
