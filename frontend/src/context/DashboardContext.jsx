import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  addExpense as addExpenseApi,
  addMember as addMemberApi,
  addSettlement as addSettlementApi,
  createGroup as createGroupApi,
  deleteExpense as deleteExpenseApi,
  deleteGroup as deleteGroupApi,
  deleteMember as deleteMemberApi,
  getBalances,
  getExpenses,
  getGroup,
  getGroups,
  getTransactions
} from "../api";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const members = group?.members || [];

  const refreshGroups = async () => {
    const data = await getGroups();
    setGroups(data);
    if (!selectedGroupId && data.length > 0) {
      setSelectedGroupId(data[0]._id);
    }
    if (selectedGroupId && !data.some((g) => g._id === selectedGroupId)) {
      setSelectedGroupId(data[0]?._id || "");
    }
  };

  const refreshGroupData = async (groupId = selectedGroupId) => {
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name) => {
    const created = await createGroupApi({ name });
    await refreshGroups();
    setSelectedGroupId(created._id);
    return created;
  };

  const addMember = async (name) => {
    if (!selectedGroupId) return;
    await addMemberApi(selectedGroupId, { name });
    await refreshGroupData(selectedGroupId);
  };

  const removeGroup = async (groupId) => {
    await deleteGroupApi(groupId);
    if (selectedGroupId === groupId) {
      setSelectedGroupId("");
    }
    await refreshGroups();
  };

  const removeMember = async (memberId) => {
    if (!selectedGroupId) return;
    await deleteMemberApi(selectedGroupId, memberId);
    await refreshGroupData(selectedGroupId);
  };

  const addExpense = async (payload) => {
    if (!selectedGroupId) return;
    await addExpenseApi(selectedGroupId, payload);
    await refreshGroupData(selectedGroupId);
  };

  const removeExpense = async (expenseId) => {
    if (!selectedGroupId) return;
    await deleteExpenseApi(selectedGroupId, expenseId);
    await refreshGroupData(selectedGroupId);
  };

  const addSettlement = async (payload) => {
    if (!selectedGroupId) return;
    await addSettlementApi(selectedGroupId, payload);
    await refreshGroupData(selectedGroupId);
  };

  useEffect(() => {
    refreshGroups().catch((err) => {
      setError(err.response?.data?.message || "Failed to load groups.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      refreshGroupData(selectedGroupId);
    } else {
      setGroup(null);
      setBalances([]);
      setTransactions([]);
      setExpenses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId]);

  const value = useMemo(
    () => ({
      groups,
      selectedGroupId,
      setSelectedGroupId,
      group,
      members,
      balances,
      transactions,
      expenses,
      loading,
      error,
      setError,
      refreshGroups,
      refreshGroupData,
      createGroup,
      addMember,
      removeGroup,
      removeMember,
      addExpense,
      removeExpense,
      addSettlement
    }),
    [
      groups,
      selectedGroupId,
      group,
      members,
      balances,
      transactions,
      expenses,
      loading,
      error
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
};
