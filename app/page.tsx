
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

const initialTransactions: Transaction[] = [
  { id: "1", title: "Monthly Salary", amount: 100000, type: "income", category: "Salary", date: "2026-11-01" },
  { id: "2", title: "Grocery Shopping", amount: 5000, type: "expense", category: "Food", date: "2026-11-03" },
  { id: "3", title: "Freelance Payment", amount: 20000, type: "income", category: "Freelancing", date: "2026-11-05" },
  { id: "4", title: "Electricity Bill", amount: 4000, type: "expense", category: "Bills", date: "2026-11-08" },
  { id: "5", title: "Transport", amount: 2000, type: "expense", category: "Transport", date: "2026-11-10" },
  { id: "6", title: "Shopping", amount: 3000, type: "expense", category: "Shopping", date: "2026-11-12" },
];

const categories = [
  "Food",
  "Salary",
  "Freelancing",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Entertainment",
  "Other",
];

const chartColors = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isLoaded, setIsLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("2026-11-14");

  // Load saved transactions from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("expense-tracker-transactions");

      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch {
      console.error("Unable to load saved transactions.");
    }

    setIsLoaded(true);
  }, []);

  // Save transactions whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "expense-tracker-transactions",
        JSON.stringify(transactions)
      );
    }
  }, [transactions, isLoaded]);

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Search and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || t.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter;

      const matchesDate =
        !dateFilter || t.date === dateFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesDate
      );
    });
  }, [transactions, search, typeFilter, categoryFilter, dateFilter]);

  // Format currency
  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(value);

  // Reset form
  function resetForm() {
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Food");
    setDate("2026-11-14");
    setEditingId(null);
    setShowForm(false);
  }

  // Open add form
  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  // Add or update transaction
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim() || Number(amount) <= 0 || !date) {
      return;
    }

    const transaction: Transaction = {
      id: editingId ?? crypto.randomUUID(),
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date,
    };

    if (editingId) {
      setTransactions((prev) =>
        prev.map((t) => t.id === editingId ? transaction : t)
      );
    } else {
      setTransactions((prev) => [transaction, ...prev]);
    }

    resetForm();
  }

  // Edit transaction
  function handleEdit(t: Transaction) {
    setTitle(t.title);
    setAmount(String(t.amount));
    setType(t.type);
    setCategory(t.category);
    setDate(t.date);
    setEditingId(t.id);
    setShowForm(true);
  }

  // Delete transaction
  function handleDelete(id: string) {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  }

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    return months.map((month, index) => {
      const income = transactions
        .filter((t) => t.type === "income" && new Date(t.date + "T00:00:00").getMonth() === index)
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter((t) => t.type === "expense" && new Date(t.date + "T00:00:00").getMonth() === index)
        .reduce((sum, t) => sum + t.amount, 0);

      return { month, income, expense };
    });
  }, [transactions]);

  // Expense category chart data
  const categoryData = useMemo(() => {
    return categories
      .map((name) => ({
        name,
        value: transactions
          .filter((t) => t.type === "expense" && t.category === name)
          .reduce((sum, t) => sum + t.amount, 0),
      }))
      .filter((item) => item.value > 0);
  }, [transactions]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 bg-slate-950 p-6 text-white md:block">

          <h1 className="mb-12 text-2xl font-bold">
            Expense<span className="text-emerald-400">Flow</span>
          </h1>

          <p className="mb-4 text-xs uppercase tracking-widest text-slate-500">
            Main Menu
          </p>

          <nav className="space-y-3">
            <a href="#dashboard" className="block rounded-xl bg-emerald-500 px-4 py-3 font-medium">
              Dashboard
            </a>

            <a href="#transactions" className="block rounded-xl px-4 py-3 text-slate-400 hover:bg-slate-900 hover:text-white">
              Transactions
            </a>

            <a href="#analytics" className="block rounded-xl px-4 py-3 text-slate-400 hover:bg-slate-900 hover:text-white">
              Analytics
            </a>
          </nav>

          <div className="mt-20 rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Your finances</p>
            <p className="mt-2 text-lg font-semibold">Stay in control.</p>
            <p className="mt-2 text-xs text-slate-500">
              Track every rupee you earn and spend.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section id="dashboard" className="min-w-0 flex-1 p-5 md:p-8">

          {/* HEADER */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-sm text-slate-500">
                Personal Finance Manager
              </p>

              <h2 className="mt-1 text-2xl font-bold md:text-3xl">
                Dashboard Overview
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Welcome back! Here is your financial summary.
              </p>
            </div>

            <button
              onClick={openAddForm}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              + Add Transaction
            </button>

          </header>

          {/* SUMMARY CARDS */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Income
              </p>

              <h3 className="mt-3 text-2xl font-bold text-emerald-600">
                {formatMoney(totalIncome)}
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                All income transactions
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Expenses
              </p>

              <h3 className="mt-3 text-2xl font-bold text-red-500">
                {formatMoney(totalExpenses)}
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                All expense transactions
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Available Balance
              </p>

              <h3 className="mt-3 text-2xl font-bold text-blue-600">
                {formatMoney(balance)}
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                Income minus expenses
              </p>
            </div>

          </div>

          {/* CHARTS */}
          <div id="analytics" className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* INCOME VS EXPENSE CHART */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

              <h3 className="text-lg font-bold">
                Income vs Expenses
              </h3>

              <p className="mb-5 mt-1 text-sm text-slate-500">
                Monthly financial comparison
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatMoney(Number(value))} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* CATEGORY CHART */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

              <h3 className="text-lg font-bold">
                Expense Categories
              </h3>

              <p className="mb-5 mt-1 text-sm text-slate-500">
                Spending by category
              </p>

              <div className="h-72 w-full">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {categoryData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip formatter={(value) => formatMoney(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No expense data available.
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* TRANSACTION HISTORY */}
          <div id="transactions" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

              <div>
                <h3 className="text-xl font-bold">
                  Transaction History
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your income and expenses.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                {filteredTransactions.length} transactions
              </span>

            </div>

            {/* SEARCH AND FILTERS */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
              />

            </div>

            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setCategoryFilter("all");
                setDateFilter("");
              }}
              className="mb-5 text-sm font-medium text-emerald-700 hover:underline"
            >
              Clear all filters
            </button>

            {/* TABLE */}
            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px] text-left">

                <thead>
                  <tr className="border-b border-slate-100 text-sm text-slate-500">
                    <th className="px-3 py-4 font-medium">Transaction</th>
                    <th className="px-3 py-4 font-medium">Category</th>
                    <th className="px-3 py-4 font-medium">Date</th>
                    <th className="px-3 py-4 font-medium">Type</th>
                    <th className="px-3 py-4 font-medium">Amount</th>
                    <th className="px-3 py-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTransactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >

                      <td className="px-3 py-4 font-medium">
                        {t.title}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-500">
                        {t.category}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-500">
                        {t.date}
                      </td>

                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          t.type === "income"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {t.type}
                        </span>
                      </td>

                      <td className={`px-3 py-4 font-semibold ${
                        t.type === "income" ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {t.type === "income" ? "+" : "-"}
                        {formatMoney(t.amount)}
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex gap-3">

                          <button
                            onClick={() => handleEdit(t)}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-sm font-medium text-red-500 hover:underline"
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        No transactions found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>

      </div>

      {/* ADD / EDIT TRANSACTION MODAL */}
      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">

          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >

            <div className="mb-6 flex items-center justify-between">

              <h3 className="text-xl font-bold">
                {editingId ? "Edit Transaction" : "Add Transaction"}
              </h3>

              <button
                type="button"
                onClick={resetForm}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Transaction Title
                </label>

                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Salary"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Amount (PKR)
                </label>

                <input
                  required
                  min="1"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Type
                  </label>

                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "income" | "expense")}
                    className="w-full rounded-xl border border-slate-200 p-3"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date
                </label>

                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
              </div>

            </div>

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-xl border border-slate-200 py-3 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                {editingId ? "Save Changes" : "Add Transaction"}
              </button>

            </div>

          </form>

        </div>

      )}

    </main>
  );
}
