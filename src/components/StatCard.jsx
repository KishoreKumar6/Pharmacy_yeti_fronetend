const StatCard = ({ title, value }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
  </article>
)

export default StatCard
