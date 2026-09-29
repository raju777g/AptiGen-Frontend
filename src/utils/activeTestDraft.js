export function getActiveTestDraftKey(user) {
  const identity = user?.id ?? user?.email ?? "anonymous";
  return `aptigen-active-test-v1:${encodeURIComponent(String(identity))}`;
}

export function readActiveTestDraft(user) {
  try {
    const raw = localStorage.getItem(getActiveTestDraftKey(user));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveTestDraft(user, draft) {
  try {
    localStorage.setItem(getActiveTestDraftKey(user), JSON.stringify(draft));
  } catch {
    // The in-memory attempt still works if browser storage is unavailable.
  }
}

export function clearActiveTestDraft(user) {
  try {
    localStorage.removeItem(getActiveTestDraftKey(user));
  } catch {
    // Nothing to clear when browser storage is unavailable.
  }
}
