import { useEffect, useMemo, useState } from "react";
import {
  addExpense,
  addMember,
  addSettlement,
  createGroup,
  getBalances,
  getExpenses,
  getGroup,
  getGroups,
  getTransactions
} from "../api";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const COLORS = ["#22d3ee", "#3b82f6", "#14b8a6", "#60a5fa", "#06b6d4", "#38bdf8"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value || 0);

const shortName = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitType: "equal"
  });
  const [equalParticipants, setEqualParticipants] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [settlementForm, setSettlementForm] = useState({
    from: "",
    to: "",
    amount: "",
    note: ""
  });

  const members = group?.members || [];

  const totalCustomSplit = useMemo(
    () =>
      Object.values(customSplits).reduce((sum, value) => {
        const parsed = Number(value || 0);
        return sum + (Number.isNaN(parsed) ? 0 : parsed);
      }, 0),
    [customSplits]
  );

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

  const expenseTrend = useMemo(() => {
    const map = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      map[key] = (map[key] || 0) + Number(expense.amount || 0);
    });

    return Object.entries(map)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-10)
      .map(([isoDate, amount]) => ({
        date: new Date(isoDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        amount: Number(amount.toFixed(2))
      }));
  }, [expenses]);

  const summary = useMemo(() => {
    const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalSettled = transactions
      .filter((tx) => tx.type === "settlement")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const pending = balances.reduce((sum, b) => sum + Number(b.amount || 0), 0);

    return {
      totalSpent: Number(totalSpent.toFixed(2)),
      totalSettled: Number(totalSettled.toFixed(2)),
      pending: Number(pending.toFixed(2))
    };
  }, [balances, expenses, transactions]);

  const loadGroups = async () => {
    const data = await getGroups();
    setGroups(data);
    if (!selectedGroupId && data.length > 0) {
      setSelectedGroupId(data[0]._id);
    }
  };

  const loadDashboardData = async (groupId) => {
    if (!groupId) return;
    setLoading(true);
    setError("");
    try {
      const [groupData, balancesData, transactionsData, expensesData] = await Promise.all([
        getGroup(groupId),
        getBalances(groupId),
        getTransactions(groupId),
        getExpenses(groupId)
      ]);

      setGroup(groupData);
      setBalances(balancesData);
      setTransactions(transactionsData);
      setExpenses(expensesData);
      setEqualParticipants(groupData.members.map((member) => member._id));
      setCustomSplits(
        groupData.members.reduce((acc, member) => {
          acc[member._id] = "";
          return acc;
        }, {})
      );

      setExpenseForm((prev) => ({
        ...prev,
        paidBy: groupData.members[0]?._id || ""
      }));
      setSettlementForm((prev) => ({
        ...prev,
        from: groupData.members[0]?._id || "",
        to: groupData.members[1]?._id || groupData.members[0]?._id || ""
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups().catch((err) => {
      setError(err.response?.data?.message || "Failed to load groups.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadDashboardData(selectedGroupId);
    } else {
      setGroup(null);
      setBalances([]);
      setTransactions([]);
      setExpenses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId]);

  const onCreateGroup = async (event) => {
    event.preventDefault();
    if (!groupName.trim()) return;
    try {
      const created = await createGroup({ name: groupName });
      setGroupName("");
      await loadGroups();
      setSelectedGroupId(created._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group.");
    }
  };

  const onAddMember = async (event) => {
    event.preventDefault();
    if (!selectedGroupId || !memberName.trim()) return;
    try {
      await addMember(selectedGroupId, { name: memberName });
      setMemberName("");
      await loadDashboardData(selectedGroupId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member.");
    }
  };

  const onAddExpense = async (event) => {
    event.preventDefault();
    if (!selectedGroupId) return;
    try {
      const payload = {
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        paidBy: expenseForm.paidBy,
        splitType: expenseForm.splitType
      };

      if (expenseForm.splitType === "equal") {
        payload.memberIds = equalParticipants;
      } else {
        payload.splits = Object.entries(customSplits)
          .map(([member, share]) => ({ member, share: Number(share) }))
          .filter((item) => item.share > 0);
      }

      await addExpense(selectedGroupId, payload);
      setExpenseForm((prev) => ({ ...prev, description: "", amount: "" }));
      await loadDashboardData(selectedGroupId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense.");
    }
  };

  const onAddSettlement = async (event) => {
    event.preventDefault();
    if (!selectedGroupId) return;
    try {
      await addSettlement(selectedGroupId, {
        from: settlementForm.from,
        to: settlementForm.to,
        amount: Number(settlementForm.amount),
        note: settlementForm.note
      });
      setSettlementForm((prev) => ({ ...prev, amount: "", note: "" }));
      await loadDashboardData(selectedGroupId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record settlement.");
    }
  };

  const toggleEqualMember = (memberId) => {
    setEqualParticipants((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-4 py-6 md:px-6">
      {error ? <p className="mb-4 rounded-lg bg-rose-500/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

      <section className="grid gap-6 lg:grid-cols-[300px,1fr]">
        <aside className="glass-panel flex h-fit flex-col gap-6 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <button className="btn-secondary px-4 py-2" onClick={logout} type="button">
              Logout
            </button>
          </div>

          <div className="surface">
            <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">Signed In</p>
            <p className="mt-1 text-lg font-semibold text-white">{user?.name}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Group Control</h2>
            <form className="mt-3 space-y-3" onSubmit={onCreateGroup}>
              <input
                className="field"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Create new group"
              />
              <button className="btn-primary w-full" type="submit">
                Create Group
              </button>
            </form>

            <select
              className="select-field mt-3"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option className="bg-slate-900 text-white" value="">
                Select a group
              </option>
              {groups.map((item) => (
                <option className="bg-slate-900 text-white" key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {group ? (
            <form className="space-y-3" onSubmit={onAddMember}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Add Member</h2>
              <input
                className="field"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Member name"
              />
              <button className="btn-primary w-full" type="submit">
                Add Member
              </button>
            </form>
          ) : null}

          <div className="flex gap-2 rounded-xl bg-white/5 p-1">
            <button
              type="button"
              className={activeTab === "overview" ? "btn-primary w-full" : "btn-secondary w-full"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              type="button"
              className={activeTab === "manage" ? "btn-primary w-full" : "btn-secondary w-full"}
              onClick={() => setActiveTab("manage")}
            >
              Manage
            </button>
          </div>
        </aside>

        <section className="space-y-6">
          {loading ? <p className="text-slate-200">Loading...</p> : null}
          {!group ? (
            <div className="glass-panel">
              <p className="text-slate-200">Create or select a group to continue.</p>
              <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={onCreateGroup}>
                <input
                  className="field"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter new group name"
                />
                <button className="btn-primary sm:w-auto" type="submit">
                  Create Group
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="glass-panel">
                <h2 className="text-3xl font-semibold text-white">{group.name}</h2>
                <p className="mt-2 text-sm text-slate-200">
                  Members: {members.length ? members.map((m) => m.name).join(", ") : "No members yet"}
                </p>
              </div>

              {activeTab === "overview" ? (
                <>
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
                      <p className="text-sm text-slate-300">Pending Balance</p>
                      <p className="mt-2 text-2xl font-bold text-cyan-200">{formatCurrency(summary.pending)}</p>
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
                      <h3 className="text-xl font-semibold text-white">Expense Trend</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-300">Last 10 Days With Activity</p>
                      <div className="mt-4 h-72">
                        {expenseTrend.length === 0 ? (
                          <p className="text-sm text-slate-300">No expense trend available.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={expenseTrend}>
                              <XAxis dataKey="date" stroke="#cbd5e1" />
                              <YAxis stroke="#cbd5e1" />
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#22d3ee" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
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
                </>
              ) : (
                <>
                  <div className="grid gap-6 xl:grid-cols-2">
                    <form className="glass-panel space-y-3" onSubmit={onAddExpense}>
                      <h3 className="text-xl font-semibold text-white">Add Expense</h3>
                      <input
                        className="field"
                        placeholder="Place / expense head (e.g. Hotel, Cab, Lunch)"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))}
                      />
                      <input
                        className="field"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                      />
                      <select
                        className="select-field"
                        value={expenseForm.paidBy}
                        onChange={(e) => setExpenseForm((prev) => ({ ...prev, paidBy: e.target.value }))}
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
                        value={expenseForm.splitType}
                        onChange={(e) => setExpenseForm((prev) => ({ ...prev, splitType: e.target.value }))}
                      >
                        <option className="bg-slate-900 text-white" value="equal">
                          Equal split
                        </option>
                        <option className="bg-slate-900 text-white" value="custom">
                          Custom split
                        </option>
                      </select>

                      {expenseForm.splitType === "equal" ? (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-200">Split between:</p>
                          {members.map((member) => (
                            <label className="flex items-center gap-2 text-sm text-slate-100" key={member._id}>
                              <input
                                type="checkbox"
                                checked={equalParticipants.includes(member._id)}
                                onChange={() => toggleEqualMember(member._id)}
                              />
                              {member.name}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-200">Custom shares:</p>
                          {members.map((member) => (
                            <div className="grid grid-cols-[1fr,130px] items-center gap-3" key={member._id}>
                              <span className="text-sm text-slate-100">{member.name}</span>
                              <input
                                className="field"
                                type="number"
                                min="0"
                                step="0.01"
                                value={customSplits[member._id] || ""}
                                onChange={(e) =>
                                  setCustomSplits((prev) => ({ ...prev, [member._id]: e.target.value }))
                                }
                                placeholder="0.00"
                              />
                            </div>
                          ))}
                          <p className="text-xs text-slate-300">Total: {formatCurrency(totalCustomSplit)}</p>
                        </div>
                      )}

                      <button className="btn-primary w-full" type="submit" disabled={members.length < 2}>
                        Save Expense
                      </button>
                    </form>

                    <form className="glass-panel space-y-3" onSubmit={onAddSettlement}>
                      <h3 className="text-xl font-semibold text-white">Record Settlement</h3>
                      <select
                        className="select-field"
                        value={settlementForm.from}
                        onChange={(e) => setSettlementForm((prev) => ({ ...prev, from: e.target.value }))}
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
                        value={settlementForm.to}
                        onChange={(e) => setSettlementForm((prev) => ({ ...prev, to: e.target.value }))}
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
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount"
                        value={settlementForm.amount}
                        onChange={(e) => setSettlementForm((prev) => ({ ...prev, amount: e.target.value }))}
                      />
                      <input
                        className="field"
                        placeholder="Note (optional)"
                        value={settlementForm.note}
                        onChange={(e) => setSettlementForm((prev) => ({ ...prev, note: e.target.value }))}
                      />
                      <button className="btn-primary w-full" type="submit" disabled={members.length < 2}>
                        Save Settlement
                      </button>
                    </form>
                  </div>

                  <div className="glass-panel">
                    <h3 className="text-xl font-semibold text-white">Transaction History</h3>
                    {transactions.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-200">No transactions yet.</p>
                    ) : (
                      <ul className="mt-3 space-y-3 text-sm text-slate-100">
                        {transactions.map((tx) => (
                          <li key={tx._id} className="surface">
                            <p className="font-medium">{new Date(tx.createdAt).toLocaleString()}</p>
                            <p>
                              {tx.type === "expense"
                                ? `${tx.from.name} owes ${tx.to.name}`
                                : `${tx.from.name} paid ${tx.to.name}`} {formatCurrency(tx.amount)}
                              {tx.note ? ` (${tx.note})` : ""}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  );
};

export default DashboardPage;
