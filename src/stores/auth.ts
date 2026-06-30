// src/stores/auth.ts
import { create } from 'zustand';

interface AuthState {
  isLogin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

// 从CF环境变量读取预设管理员账号密码
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

export const useAuthStore = create<AuthState>((set) => ({
  isLogin: !!localStorage.getItem('admin_login'),
  login: (user, pass) => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem('admin_login', '1');
      set({ isLogin: true });
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem('admin_login');
    set({ isLogin: false });
  },
}));