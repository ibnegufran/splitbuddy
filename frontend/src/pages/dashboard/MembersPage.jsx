import { useState } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useDashboard } from "../../context/DashboardContext";

const MembersPage = () => {
  const { group, members, addMember, removeMember } = useDashboard();
  const [memberName, setMemberName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const onAddMember = async (event) => {
    event.preventDefault();
    if (!memberName.trim()) return;
    setLoading(true);
    try {
      await addMember(memberName.trim());
      setMemberName("");
    } finally {
      setLoading(false);
    }
  };

  if (!group) return <div className="glass-panel">Select a group first from the Groups page.</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel">
        <h1 className="text-3xl font-semibold text-white">Members</h1>
        <p className="mt-2 text-sm text-slate-200">Manage members in {group.name}.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
        <form className="glass-panel space-y-3" onSubmit={onAddMember}>
          <h2 className="text-xl font-semibold text-white">Add Member</h2>
          <input
            className="field"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            placeholder="Member name"
          />
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? "Adding..." : "Add Member"}
          </button>
        </form>

        <div className="glass-panel">
          <h2 className="text-xl font-semibold text-white">Current Members</h2>
          {members.length === 0 ? (
            <p className="mt-3 text-sm text-slate-300">No members yet.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {members.map((member) => (
                <div className="surface" key={member._id}>
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="mt-1 text-xs text-slate-300">Member ID: {member._id.slice(-6)}</p>
                  <button
                    className="mt-3 rounded-lg border border-rose-300/40 bg-rose-400/15 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-400/25"
                    onClick={() => setMemberToDelete(member)}
                    type="button"
                  >
                    Delete Member
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(memberToDelete)}
        title="Delete Member"
        message={
          memberToDelete
            ? `Delete "${memberToDelete.name}"? Related expenses/transactions for this member will also be removed.`
            : ""
        }
        confirmText="Delete"
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setMemberToDelete(null);
        }}
        onConfirm={async () => {
          if (!memberToDelete) return;
          setDeleting(true);
          try {
            await removeMember(memberToDelete._id);
            setMemberToDelete(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
};

export default MembersPage;
