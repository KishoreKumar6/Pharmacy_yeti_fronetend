const SummaryCard = ({ label, value }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <h3 className="mt-2 text-2xl font-bold text-slate-800">{value}</h3>
  </article>
)

export default SummaryCard
