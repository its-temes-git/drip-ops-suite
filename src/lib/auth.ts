import { User } from './api';

export const auth = {
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  removeToken: () => {
    localStorage.removeItem('token');
  },
  decodeToken: (): User | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      
      // Check for expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        localStorage.removeItem('token');
        return null;
      }

      return payload as User;
    } catch (error) {
      console.error('Failed to decode token', error);
      localStorage.removeItem('token');
      return null;
    }
  }
};
