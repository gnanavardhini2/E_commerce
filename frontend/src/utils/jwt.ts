export function decodeJWT(token: string) {
  if (!token) return null;
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}

export function getEmailFromToken(token: string) {
  const decoded = decodeJWT(token);
  return decoded?.sub || decoded?.email || '';
}
