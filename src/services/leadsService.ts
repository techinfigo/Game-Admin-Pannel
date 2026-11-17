/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth } from '../firebase';

// The public website (Next.js) hosts an Admin-SDK endpoint that reads the
// lead collections (callbackRequests, mentorshipLeads). Those collections are
// written by the website with the Admin SDK and are not exposed to client-SDK
// reads by the deployed Firestore rules, so the admin panel reads them through
// that endpoint instead of directly from Firestore.
const WEBSITE_API_BASE =
  (import.meta as any).env?.VITE_WEBSITE_API_BASE || 'https://www.gameacademy.in';

/**
 * Reads an admin-only lead collection via the website's Admin-SDK endpoint,
 * authenticated with the current admin's Firebase ID token.
 */
export async function fetchLeads<T>(collectionName: string): Promise<(T & { id: string })[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in again.');

  const token = await user.getIdToken();
  const res = await fetch(
    `${WEBSITE_API_BASE}/api/admin/leads?collection=${encodeURIComponent(collectionName)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Could not load records right now.');
  }
  return (data?.items || []) as (T & { id: string })[];
}
