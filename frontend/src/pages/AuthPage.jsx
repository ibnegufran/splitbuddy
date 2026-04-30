import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthPage = ({ mode }) => {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section className="glass-panel w-full">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/90">SplitBuddy</p>
          <Link to="/" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300 hover:text-cyan-100">
            Home
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-white">{isSignup ? "Create account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-slate-300">
          {isSignup ? "Start splitting smartly in seconds." : "Log in to manage your groups."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {isSignup && (
            <input
              className="field"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          )}
          <input
            className="field"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="field"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-300">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link className="font-semibold text-cyan-200 hover:text-cyan-100" to={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Log in" : "Create one"}
          </Link>
        </p>
      </section>
    </main>
  );
};

export default AuthPage;
