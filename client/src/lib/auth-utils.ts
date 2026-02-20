export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function logout() {
  localStorage.removeItem("mockUser");
  localStorage.removeItem("mockOtp");
  window.location.href = "/";
}

export function getCurrentUser() {
  try {
    const user = localStorage.getItem("mockUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    window.location.href = "/api/login";
  }, 500);
}
