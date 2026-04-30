import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { formatCurrency } from "../../utils/format";

const SettlementsPage = () => {
  const { group, members, transactions, addSettlement } = useDashboard();
  const [form, setForm] = useState({
    from: members[0]?._id || "",
    to: members[1]?._id || members[0]?._id || "",
    amount: "",
    note: ""
  });

  const settlements = useMemo(
    () => transactions.filter((tx) => tx.type === "settlement"),
    [transactions]
  );

  useEffect(() => {
    if (!members.length) return;
    setForm((prev) => ({
      ...prev,
      from: prev.from || members[0]._id,
      to: prev.to || members[1]?._id || members[0]._id
    }));
  }, [members]);

  const onSubmit = async (event) => {
    event.preventDefault();
    await addSettlement({
      from: form.from,
      to: form.to,
      amount: Number(form.amount),
      note: form.note
    });
    setForm((prev) => ({ ...prev, amount: "", note: "" }));
  };

  if (!group) return <div className="glass-panel">Select a group first from the Groups page.</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel">
        <h1 className="text-3xl font-semibold text-white">Settlements</h1>
        <p className="mt-2 text-sm text-slate-200">Track settlement payments in {group.name}.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
        <form className="glass-panel space-y-3" onSubmit={onSubmit}>
          <h2 className="text-xl font-semibold text-white">Record Settlement</h2>
          <select
            className="select-field"
            value={form.from}
            onChange={(e) => setForm((prev) => ({ ...prev, from: e.target.value }))}
          >
            <option className="bg-slate-900 text-white" value="">
              From
            </option>
            {members.map((member) => (
              <option className="bg-slate-900 text-white" key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
          <select
            className="select-field"
            value={form.to}
            onChange={(e) => setForm((prev) => ({ ...prev, to: e.target.value }))}
          >
            <option className="bg-slate-900 text-white" value="">
              To
            </option>
            {members.map((member) => (
              <option className="bg-slate-900 text-white" key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
          <input
            className="field"
            min="0"
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="Amount"
            step="0.01"
            type="number"
            value={form.amount}
          />
          <input
            className="field"
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Note (optional)"
            value={form.note}
          />
          <button className="btn-primary w-full" disabled={members.length < 2} type="submit">
            Save Settlement
          </button>
        </form>

        <div className="glass-panel">
          <h2 className="text-xl font-semibold text-white">Settlement History</h2>
          {settlements.length === 0 ? (
            <p className="mt-3 text-sm text-slate-300">No settlements yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {settlements.map((tx) => (
                <div className="surface" key={tx._id}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white">
                      {tx.from?.name} paid {tx.to?.name}
                    </p>
                    <p className="font-semibold text-cyan-100">{formatCurrency(tx.amount)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    {new Date(tx.createdAt).toLocaleString()}
                    {tx.note ? ` | ${tx.note}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementsPage;
