// Helper function to check if user is authenticated
export const checkAuth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

// Helper function to refresh token
export const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Helper function to logout
export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
    // Still redirect to login even if logout API fails
    window.location.href = '/login';
  }
};