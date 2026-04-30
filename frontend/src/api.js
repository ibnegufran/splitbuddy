import axios from "axios";

const TOKEN_KEY = "splitbuddy_token";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

export const signup = async (payload) => {
  const { data } = await api.post("/auth/signup", payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const getLandingStats = async () => {
  const { data } = await api.get("/public/landing-stats");
  return data;
};

export const getGroups = async () => {
  const { data } = await api.get("/groups");
  return data;
};

export const createGroup = async (payload) => {
  const { data } = await api.post("/groups", payload);
  return data;
};

export const deleteGroup = async (groupId) => {
  const { data } = await api.delete(`/groups/${groupId}`);
  return data;
};

export const getGroup = async (groupId) => {
  const { data } = await api.get(`/groups/${groupId}`);
  return data;
};

export const addMember = async (groupId, payload) => {
  const { data } = await api.post(`/groups/${groupId}/members`, payload);
  return data;
};

export const deleteMember = async (groupId, memberId) => {
  const { data } = await api.delete(`/groups/${groupId}/members/${memberId}`);
  return data;
};

export const addExpense = async (groupId, payload) => {
  const { data } = await api.post(`/groups/${groupId}/expenses`, payload);
  return data;
};

export const getExpenses = async (groupId) => {
  const { data } = await api.get(`/groups/${groupId}/expenses`);
  return data;
};

export const deleteExpense = async (groupId, expenseId) => {
  const { data } = await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
  return data;
};

export const addSettlement = async (groupId, payload) => {
  const { data } = await api.post(`/groups/${groupId}/settlements`, payload);
  return data;
};

export const getBalances = async (groupId) => {
  const { data } = await api.get(`/groups/${groupId}/balances`);
  return data;
};

export const getTransactions = async (groupId) => {
  const { data } = await api.get(`/groups/${groupId}/transactions`);
  return data;
};

export default api;
