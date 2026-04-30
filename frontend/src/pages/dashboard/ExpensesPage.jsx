import { useEffect, useState } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useDashboard } from "../../context/DashboardContext";
import { formatCurrency } from "../../utils/format";

const ExpensesPage = () => {
  const { group, members, expenses, addExpense, removeExpense } = useDashboard();
  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidBy: members[0]?._id || "",
    splitType: "equal"
  });
  const [equalParticipants, setEqualParticipants] = useState(members.map((m) => m._id));
  const [customSplits, setCustomSplits] = useState({});
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (members.length > 0) {
      setForm((prev) => ({ ...prev, paidBy: prev.paidBy || members[0]._id }));
      setEqualParticipants(members.map((m) => m._id));
      setCustomSplits(
        members.reduce((acc, member) => {
          acc[member._id] = "";
          return acc;
        }, {})
      );
    }
  }, [members]);

  const totalCustom = Object.values(customSplits).reduce((sum, value) => sum + Number(value || 0), 0);

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      description: form.description,
      amount: Number(form.amount),
      paidBy: form.paidBy,
      splitType: form.splitType
    };
    if (form.splitType === "equal") {
      payload.memberIds = equalParticipants;
    } else {
      payload.splits = Object.entries(customSplits)
        .map(([member, share]) => ({ member, share: Number(share) }))
        .filter((s) => s.share > 0);
    }
    await addExpense(payload);
    setForm((prev) => ({ ...prev, description: "", amount: "" }));
  };

  const toggleEqual = (memberId) => {
    setEqualParticipants((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  if (!group) return <div className="glass-panel">Select a group first from the Groups page.</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel">
        <h1 className="text-3xl font-semibold text-white">Expenses</h1>
        <p className="mt-2 text-sm text-slate-200">Add and review all expenses for {group.name}.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[460px,1fr]">
        <form className="glass-panel space-y-3" onSubmit={onSubmit}>
          <h2 className="text-xl font-semibold text-white">Add Expense</h2>
          <input
            className="field"
            placeholder="Place / expense head (e.g. Hotel, Cab, Lunch)"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <input
            className="field"
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          />
          <select
            className="select-field"
            value={form.paidBy}
            onChange={(e) => setForm((p) => ({ ...p, paidBy: e.target.value }))}
          >
            <option className="bg-slate-900 text-white" value="">
              Paid by
            </option>
            {members.map((member) => (
              <option className="bg-slate-900 text-white" key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
          <select
            className="select-field"
            value={form.splitType}
            onChange={(e) => setForm((p) => ({ ...p, splitType: e.target.value }))}
          >
            <option className="bg-slate-900 text-white" value="equal">
              Equal split
            </option>
            <option className="bg-slate-900 text-white" value="custom">
              Custom split
            </option>
          </select>

          {form.splitType === "equal" ? (
            <div className="space-y-2">
              {members.map((member) => (
                <label className="flex items-center gap-2 text-sm text-slate-100" key={member._id}>
                  <input
                    checked={equalParticipants.includes(member._id)}
                    onChange={() => toggleEqual(member._id)}
                    type="checkbox"
                  />
                  {member.name}
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div className="grid grid-cols-[1fr,120px] items-center gap-2" key={member._id}>
                  <span className="text-sm text-slate-100">{member.name}</span>
                  <input
                    className="field"
                    min="0"
                    onChange={(e) => setCustomSplits((prev) => ({ ...prev, [member._id]: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    value={customSplits[member._id] || ""}
                  />
                </div>
              ))}
              <p className="text-xs text-slate-300">Custom total: {formatCurrency(totalCustom)}</p>
            </div>
          )}

          <button className="btn-primary w-full" disabled={members.length < 2} type="submit">
            Save Expense
          </button>
        </form>

        <div className="glass-panel">
          <h2 className="text-xl font-semibold text-white">Expense History</h2>
          {expenses.length === 0 ? (
            <p className="mt-3 text-sm text-slate-300">No expenses yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {expenses.map((expense) => (
                <div className="surface" key={expense._id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white">{expense.description}</p>
                    <p className="text-sm font-semibold text-cyan-100">{formatCurrency(expense.amount)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Paid by {expense.paidBy?.name || "Unknown"} | {new Date(expense.createdAt).toLocaleString()}
                  </p>
                  <button
                    className="mt-3 rounded-lg border border-rose-300/40 bg-rose-400/15 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-400/25"
                    onClick={() => setExpenseToDelete(expense)}
                    type="button"
                  >
                    Delete Expense
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(expenseToDelete)}
        title="Delete Expense"
        message={expenseToDelete ? `Delete "${expenseToDelete.description}"?` : ""}
        confirmText="Delete"
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setExpenseToDelete(null);
        }}
        onConfirm={async () => {
          if (!expenseToDelete) return;
          setDeleting(true);
          try {
            await removeExpense(expenseToDelete._id);
            setExpenseToDelete(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
};

export default ExpensesPage;
