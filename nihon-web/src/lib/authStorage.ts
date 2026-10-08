// The signed-in session lives in localStorage; every read and write goes through this module.
const TOKEN_KEY = "token";
const USER_NAME_KEY = "user_name";
const USER_EMAIL_KEY = "user_email";
const USER_ROLE_KEY = "user_role";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUserName = () => localStorage.getItem(USER_NAME_KEY);
export const getUserEmail = () => localStorage.getItem(USER_EMAIL_KEY);

/** True when a usable token is stored; guards against values saved from a failed login response. */
export function hasSession() {
  const token = getToken();
  return Boolean(token) && token !== "undefined" && token !== "null";
}

/** Only decides which side of the app is shown; the server checks administrator access on every request. */
export const isAdmin = () => localStorage.getItem(USER_ROLE_KEY) === "admin";

export function saveSession(session: { token: string; userName: string; userEmail: string; userRole: string }) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_NAME_KEY, session.userName);
  localStorage.setItem(USER_EMAIL_KEY, session.userEmail);
  localStorage.setItem(USER_ROLE_KEY, session.userRole);
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
}
