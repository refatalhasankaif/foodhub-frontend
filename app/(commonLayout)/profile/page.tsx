'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';

interface UpdateUserPayload {
  name?: string;
  phone?: string;
  address?: string;
}

async function updateProfile(data: UpdateUserPayload): Promise<void> {
  const res = await fetch('/api/backend/auth/profile', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error || 'Failed to update profile');
  }
}

function Badge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN:    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    PROVIDER: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    CUSTOMER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[role] ?? styles.CUSTOMER}`}>
      {role}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
          {label}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200 wrap-break-word">
          {value ?? <span className="text-gray-400 italic">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

function InputField({
  label, value, onChange, type = 'text', placeholder, disabled, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled} required={required}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const user = session?.user as {
    id: string; name: string; email: string;
    emailVerified?: boolean; image?: string | null;
    phone?: string | null; address?: string | null;
    role?: string; status?: string; createdAt?: string;
  } | undefined;

  const [editing, setEditing]        = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName]              = useState('');
  const [phone, setPhone]            = useState('');
  const [address, setAddress]        = useState('');
  const [toast, setToast]            = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  function showToast(text: string, type: 'success' | 'error') {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }

  function handleEditClick() {
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
    setAddress(user?.address ?? '');
    setEditing(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateProfile({
          name: name || undefined,
          phone: phone || undefined,
          address: address || undefined,
        });
        await authClient.getSession();
        setEditing(false);
        showToast('Profile updated successfully!', 'success');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Update failed', 'error');
      }
    });
  }

  if (sessionLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400 text-xl mb-4">
            You need to be signed in to view this page.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const role = user.role ?? 'CUSTOMER';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
        My Profile
      </h1>

      {toast && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
        }`}>
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="relative w-full h-40 bg-linear-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              {user.image ? (
                <div className="relative w-20 h-20">
                  <Image
                    src={user.image} alt={user.name} fill sizes="80px"
                    className="rounded-full object-cover ring-4 ring-white dark:ring-gray-800"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-3xl font-bold text-green-700 dark:text-green-300">
                  {initials}
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col items-center text-center gap-3">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge role={role} />
                {user.emailVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    Verified
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <span className={`w-2 h-2 rounded-full ${(user.status ?? 'ACTIVE') === 'ACTIVE' ? 'bg-green-500' : 'bg-red-400'}`} />
                {(user.status ?? 'ACTIVE') === 'ACTIVE' ? 'Active account' : 'Suspended'}
              </span>
              {user.createdAt && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              {!editing && (
                <button
                  onClick={handleEditClick}
                  className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="p-6">
              {editing ? (
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                  <InputField label="Full Name" value={name} onChange={setName} placeholder="Your full name" required disabled={isPending} />
                  <InputField label="Email" value={user.email} onChange={() => {}} type="email" disabled />
                  <InputField label="Phone Number" value={phone} onChange={setPhone} placeholder="+880 1X XXXX XXXX" disabled={isPending} />
                  <InputField label="Delivery Address" value={address} onChange={setAddress} placeholder="Your default delivery address" disabled={isPending} />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-lg text-sm transition-colors">
                      {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} disabled={isPending}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-lg text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <InfoRow label="Full Name"        value={user.name} />
                  <InfoRow label="Email Address"    value={user.email} />
                  <InfoRow label="Phone Number"     value={user.phone} />
                  <InfoRow label="Delivery Address" value={user.address} />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account &amp; Security</h3>
            </div>
            <div className="p-6">
              <InfoRow label="Email Verification" value={user.emailVerified ? 'Verified' : 'Not verified'} />
              <InfoRow label="Account Status"     value={user.status ?? 'ACTIVE'} />
              <InfoRow label="Account Role"       value={role} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}