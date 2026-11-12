/**
 * Centralized API & Auth helper
 * Attaches Authorization header if user is logged in
 */

export const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('sb_token');
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('sb_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user, token) {
  if (user) {
    localStorage.setItem('sb_user', JSON.stringify(user));
    localStorage.setItem('sb_displayName', user.display_name || user.username || 'Student');
  } else {
    localStorage.removeItem('sb_user');
  }
  if (token) {
    localStorage.setItem('sb_token', token);
  } else {
    localStorage.removeItem('sb_token');
  }
  window.dispatchEvent(new Event('sb_auth_changed'));
}

export function logoutUser() {
  localStorage.removeItem('sb_user');
  localStorage.removeItem('sb_token');
  window.dispatchEvent(new Event('sb_auth_changed'));
}

export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to application/json if needed
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    console.warn("Unauthorized request. Clearing session.");
    logoutUser();
  }

  return response;
}

