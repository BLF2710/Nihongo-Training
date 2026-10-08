export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;
export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID_PATTERN.test(value);
