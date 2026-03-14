const PersonalDetailsForm = ({ personalDetail, onPersonalChange }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="mb-4 text-lg font-semibold text-slate-800">Personal detail</h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
        Name
        <input
          required
          type="text"
          value={personalDetail.name}
          onChange={(event) => onPersonalChange('name', event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
        Age
        <input
          required
          min="1"
          type="number"
          value={personalDetail.age}
          onChange={(event) => onPersonalChange('age', event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
        Gender
        <select
          value={personalDetail.gender}
          onChange={(event) => onPersonalChange('gender', event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
        PhoneNo
        <input
          required
          type="text"
          value={personalDetail.phoneNo}
          onChange={(event) => onPersonalChange('phoneNo', event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600 sm:col-span-2 md:col-span-2">
        Address
        <textarea
          required
          rows="3"
          value={personalDetail.address}
          onChange={(event) => onPersonalChange('address', event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
        />
      </label>
    </div>
  </div>
)

export default PersonalDetailsForm
