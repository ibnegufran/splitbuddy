import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

const HomePage = () => {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <nav className="glass-panel mb-8 flex items-center justify-between py-4">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
        </nav>

        <section className="glass-panel relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -top-32 -right-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.08fr,0.92fr]">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-cyan-200/30 bg-cyan-200/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Professional Group Expense Platform
              </p>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                Split expenses clearly and settle faster.
              </h1>
              <p className="mt-5 max-w-2xl text-slate-200/90">
                SplitBuddy helps teams, roommates, and travel groups track shared costs, apply equal or custom
                splits, and settle dues with complete transparency.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="btn-primary">
                  Create Free Account
                </Link>
                <Link to="/login" className="btn-secondary">
                  Sign In
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-cyan-100">Step 1</p>
                <p className="mt-1 text-sm font-semibold text-white">Create group and add members</p>
              </div>
              <div className="rounded-xl border border-blue-300/30 bg-blue-300/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-blue-100">Step 2</p>
                <p className="mt-1 text-sm font-semibold text-white">Add expenses with equal or custom split</p>
              </div>
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/20 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-emerald-100">Step 3</p>
                <p className="mt-1 text-sm font-semibold text-white">Review balances and settle confidently</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="glass-panel">
            <h3 className="text-lg font-semibold text-white">Equal and Custom Splits</h3>
            <p className="mt-2 text-sm text-slate-300">Handle simple bills and complex distributions accurately.</p>
          </div>
          <div className="glass-panel">
            <h3 className="text-lg font-semibold text-white">Live Balance Tracking</h3>
            <p className="mt-2 text-sm text-slate-300">Know exactly who owes whom in real time.</p>
          </div>
          <div className="glass-panel">
            <h3 className="text-lg font-semibold text-white">Settlement History</h3>
            <p className="mt-2 text-sm text-slate-300">Keep a clear record of every payment and adjustment.</p>
          </div>
        </section>

        <section className="glass-panel mt-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-semibold text-white">Ready to simplify shared expenses?</h3>
            <p className="mt-2 text-sm text-slate-300">Start with SplitBuddy and manage group spending professionally.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/signup" className="btn-primary">
              Start Now
            </Link>
            <Link to="/login" className="btn-secondary">
              Log In
            </Link>
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-start justify-between gap-3 text-sm text-slate-300 md:flex-row md:items-center">
          <p>SplitBuddy | Track, split, settle smarter.</p>
          <div className="flex gap-5">
            <span>Secure Auth</span>
            <span>Custom Splits</span>
            <span>Live Balances</span>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default HomePage;
