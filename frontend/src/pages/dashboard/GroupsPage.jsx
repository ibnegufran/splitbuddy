import { useState } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useDashboard } from "../../context/DashboardContext";

const GroupsPage = () => {
  const { groups, selectedGroupId, setSelectedGroupId, createGroup, removeGroup, loading } =
    useDashboard();
  const [groupName, setGroupName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const onCreateGroup = async (event) => {
    event.preventDefault();
    if (!groupName.trim()) return;
    setSubmitting(true);
    try {
      await createGroup(groupName.trim());
      setGroupName("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel">
        <h1 className="text-3xl font-semibold text-white">Groups</h1>
        <p className="mt-2 text-sm text-slate-200">Create and manage your trip or shared-expense groups.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
        <form className="glass-panel space-y-3" onSubmit={onCreateGroup}>
          <h2 className="text-xl font-semibold text-white">Create New Group</h2>
          <input
            className="field"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Weekend Goa Trip"
          />
          <button className="btn-primary w-full" disabled={submitting} type="submit">
            {submitting ? "Creating..." : "Create Group"}
          </button>
        </form>

        <div className="glass-panel">
          <h2 className="text-xl font-semibold text-white">All Groups</h2>
          {loading ? <p className="mt-3 text-sm text-slate-300">Loading groups...</p> : null}
          {!loading && groups.length === 0 ? (
            <p className="mt-3 text-sm text-slate-300">No groups yet. Create one to start splitting.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {groups.map((item) => (
                <div
                  key={item._id}
                  className={`rounded-xl border p-4 transition ${
                    item._id === selectedGroupId
                      ? "border-cyan-300/50 bg-cyan-300/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => setSelectedGroupId(item._id)}
                    type="button"
                    className="w-full text-left"
                  >
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-300">Click to open this group</p>
                  </button>
                  <button
                    className="mt-3 rounded-lg border border-rose-300/40 bg-rose-400/15 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-400/25"
                    onClick={() => setGroupToDelete(item)}
                    type="button"
                  >
                    Delete Group
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(groupToDelete)}
        title="Delete Group"
        message={
          groupToDelete
            ? `Delete "${groupToDelete.name}"? This will remove all members, expenses and transactions.`
            : ""
        }
        confirmText="Delete"
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setGroupToDelete(null);
        }}
        onConfirm={async () => {
          if (!groupToDelete) return;
          setDeleting(true);
          try {
            await removeGroup(groupToDelete._id);
            setGroupToDelete(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
};

export default GroupsPage;
