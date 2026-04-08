const Sidebar = ({ menuItems, activePage, onMenuClick }) => (
  <aside className="flex w-full flex-col gap-6 border-b border-slate-200 bg-white p-4 lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
    <div className="flex items-center gap-3 rounded-xl px-2 py-1">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-lg font-bold text-white">
        K
      </div>
      <div>
        <h1 className="text-xl font-bold text-blue-700">Kumaran Medicals</h1>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          and General Stores
        </p>
      </div>
    </div>

    <nav className="flex flex-col gap-2" aria-label="Sidebar menu">
      {menuItems.map((item) => (
        <button
          key={item.key}
          className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
            activePage === item.key
              ? "bg-blue-600 text-white shadow"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          type="button"
          onClick={() => onMenuClick(item)}
        >
          {item.label}
        </button>
      ))}
    </nav>

    <div className="mt-auto flex items-center gap-3 rounded-xl bg-slate-100 p-3">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-200 text-xs font-bold text-blue-900">
        KM
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">Kumaran Medicals</p>
        <p className="text-xs text-slate-500">Administrator</p>
      </div>
    </div>
  </aside>
);

export default Sidebar;
