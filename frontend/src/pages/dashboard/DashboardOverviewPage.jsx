import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboard } from "../../context/DashboardContext";
import { formatCurrency, shortName } from "../../utils/format";

const COLORS = ["#22d3ee", "#3b82f6", "#14b8a6", "#60a5fa", "#06b6d4", "#38bdf8"];

const detectCategory = (text = "") => {
  const label = text.toLowerCase();
  if (
    label.includes("food") ||
    label.includes("meal") ||
    label.includes("lunch") ||
    label.includes("dinner") ||
    label.includes("breakfast")
  ) {
    return "Food";
  }
  if (
    label.includes("travel") ||
    label.includes("cab") ||
    label.includes("uber") ||
    label.includes("flight") ||
    label.includes("train") ||
    label.includes("bus") ||
    label.includes("taxi")
  ) {
    return "Travel";
  }
  if (label.includes("hotel") || label.includes("stay") || label.includes("room") || label.includes("resort")) {
    return "Hotel";
  }
  if (label.includes("shop") || label.includes("shopping") || label.includes("buy") || label.includes("mall")) {
    return "Shopping";
  }
  return "Other";
};

const DashboardOverviewPage = () => {
  const { group, balances, expenses, transactions, loading } = useDashboard();
  const totalMembers = group?.members?.length || 0;

  const paidByData = useMemo(() => {
    const map = {};
    expenses.forEach((expense) => {
      const name = expense.paidBy?.name || "Unknown";
      map[name] = (map[name] || 0) + Number(expense.amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const placeSpendData = useMemo(() => {
    const map = {};
    expenses.forEach((expense) => {
      const key = expense.description?.trim() || "Other";
      map[key] = (map[key] || 0) + Number(expense.amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const recentActivity = useMemo(
    () =>
      [...expenses]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)
        .map((expense) => ({
          id: expense._id,
          title: expense.description,
          amount: expense.amount,
          by: expense.paidBy?.name || "Unknown",
          category: detectCategory(expense.description || ""),
          createdAt: expense.createdAt
        })),
    [expenses]
  );

  const summary = useMemo(() => {
    const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalSettled = transactions
      .filter((tx) => tx.type === "settlement")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    return {
      totalSpent: Number(totalSpent.toFixed(2)),
      totalSettled: Number(totalSettled.toFixed(2))
    };
  }, [expenses, transactions]);

  if (loading) return <p className="text-slate-200">Loading...</p>;
  if (!group) return <div className="glass-panel">Create or select a group to continue.</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel">
        <h1 className="text-3xl font-semibold text-white">{group.name}</h1>
        <p className="mt-2 text-sm text-slate-200">
          Members: {group.members.length ? group.members.map((m) => m.name).join(", ") : "No members yet"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel">
          <p className="text-sm text-slate-300">Total Spent</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(summary.totalSpent)}</p>
        </div>
        <div className="glass-panel">
          <p className="text-sm text-slate-300">Total Settled</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(summary.totalSettled)}</p>
        </div>
        <div className="glass-panel">
          <p className="text-sm text-slate-300">Total Members</p>
          <p className="mt-2 text-2xl font-bold text-cyan-200">{totalMembers}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel">
          <h3 className="text-xl font-semibold text-white">Trip Expense Analysis</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-300">Spent By Place / Head</p>
          <div className="mt-4 h-72">
            {placeSpendData.length === 0 ? (
              <p className="text-sm text-slate-300">No expense data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={placeSpendData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                    {placeSpendData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-panel">
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-300">Latest Expenses Added</p>
          {recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-slate-300">No recent expenses yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="surface relative pl-5">
                  <span className="absolute left-2 top-5 h-2 w-2 rounded-full bg-cyan-300" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-300">
                        By {item.by} | {item.category} | {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-cyan-100">{formatCurrency(item.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,1fr]">
        <div className="glass-panel">
          <h3 className="text-xl font-semibold text-white">Who Owes Whom</h3>
          {balances.length === 0 ? (
            <p className="mt-3 text-sm text-slate-200">All settled up.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {balances.map((balance, idx) => (
                <div
                  key={`${balance.from}-${balance.to}-${idx}`}
                  className="rounded-xl border border-cyan-200/20 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-400/20 text-xs font-bold text-rose-100">
                        {shortName(balance.fromName)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{balance.fromName}</p>
                        <p className="text-xs text-slate-300">Owes amount</p>
                      </div>
                    </div>
                    <div className="text-cyan-200">to</div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-right text-sm font-semibold text-white">{balance.toName}</p>
                        <p className="text-right text-xs text-slate-300">Gets paid</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-100">
                        {shortName(balance.toName)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-white/10 px-3 py-2">
                    <span className="text-xs uppercase tracking-[0.14em] text-slate-300">Amount Due</span>
                    <strong className="text-cyan-100">{formatCurrency(balance.amount)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel">
          <h3 className="text-xl font-semibold text-white">Who Has Paid Most</h3>
          {paidByData.length === 0 ? (
            <p className="mt-3 text-sm text-slate-200">No paid analysis yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {paidByData.map((row, idx) => (
                <div key={row.name} className="surface">
                  <div className="mb-2 flex items-center justify-between text-sm text-white">
                    <span>{row.name}</span>
                    <strong>{formatCurrency(row.value)}</strong>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(row.value / (paidByData[0]?.value || 1)) * 100}%`,
                        backgroundColor: COLORS[idx % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewPage;
