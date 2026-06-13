import { FormEvent, useState } from "react";
import Layout, { PageHeader } from "../components/Layout";
import { updateProfile } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);
    try {
      const updated = await updateProfile(fullName);
      setUser(updated);
      setMessage("Profile updated");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <PageHeader title="My Profile" />
      <div className="mx-auto w-full max-w-lg bg-white rounded-lg shadow p-8">
        {message && (
          <p className="mb-4 rounded bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
