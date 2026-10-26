// The signed-in session lives in localStorage; every read and write goes through this module.
const TOKEN_KEY = "token";
const USER_NAME_KEY = "user_name";
const USER_EMAIL_KEY = "user_email";
const USER_ROLE_KEY = "user_role";
// The exact, unique username (the display name in USER_NAME_KEY can be anything and is not unique).
const USER_HANDLE_KEY = "user_handle";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUserName = () => localStorage.getItem(USER_NAME_KEY);
export const getUserEmail = () => localStorage.getItem(USER_EMAIL_KEY);
export const getUserHandle = () => localStorage.getItem(USER_HANDLE_KEY);
export const saveUserHandle = (username: string) => localStorage.setItem(USER_HANDLE_KEY, username);

/** True when a usable token is stored; guards against values saved from a failed login response. */
export function hasSession() {
  const token = getToken();
  return Boolean(token) && token !== "undefined" && token !== "null";
}

/** Only decides which side of the app is shown; the server checks administrator access on every request. */
export const isAdmin = () => localStorage.getItem(USER_ROLE_KEY) === "admin";

export function saveSession(session: { token: string; userName: string; userEmail: string; userRole: string; userHandle?: string }) {
  if (session.userHandle) localStorage.setItem(USER_HANDLE_KEY, session.userHandle); else localStorage.removeItem(USER_HANDLE_KEY);
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_NAME_KEY, session.userName);
  localStorage.setItem(USER_EMAIL_KEY, session.userEmail);
  localStorage.setItem(USER_ROLE_KEY, session.userRole);
}

/** Replaces the token after a password change (the old one no longer works). */
export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function saveUserRole(userRole: string) {
  localStorage.setItem(USER_ROLE_KEY, userRole);
}

export function saveUserName(userName: string) {
  localStorage.setItem(USER_NAME_KEY, userName);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_HANDLE_KEY);
}
