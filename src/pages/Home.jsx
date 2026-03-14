import StatCard from '../components/StatCard.jsx'

const Home = ({ overviewCards }) => (
  <>
    <section className="px-6 pt-7">
      <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
      <p className="mt-2 text-sm text-slate-500">
        Manage your medical store customers, renewals and purchase records.
      </p>
    </section>

    <section className="grid grid-cols-1 gap-4 px-6 pb-6 pt-4 sm:grid-cols-2 lg:grid-cols-4">
      {overviewCards.map((card) => (
        <StatCard key={card.title} title={card.title} value={card.value} />
      ))}
    </section>
  </>
)

export default Home
