import { create } from 'zustand'
import axios from '../lib/axios'

interface UserProps {
    id?: string;
    name: string;
    email: string;
    role: string;
}

interface LoginResult {
    success: boolean;
    message?: string;
}

interface LoginProps {
    email: string;
    password: string;
}

interface AuthProps {
    user: UserProps | null;
    loading: boolean;
    checkingAuth: boolean;
    justLoggedIn: boolean;
    error: string | null;
    LogIn: (data: LoginProps) => Promise<LoginResult>;
    checkAuth: () => Promise<void>;
    LogOut: () => Promise<void>;
    clearError: () => void;
}

export const authStore = create<AuthProps>((set) => ({
    user: null,
    loading: false,
    checkingAuth: true,
    justLoggedIn: false,
    error: null,

    LogIn: async ({ email, password }: LoginProps): Promise<LoginResult> => {
        set({ loading: true, error: null })
        try {
            const res = await axios.post('/auth/signin', { email, password })
            set({ user: res.data.data, loading: false, justLoggedIn: true })
            return { success: true }

        } catch (error: any) {
            const rawMessage = error.response?.data?.message || "Invalid credentials"
            
            const message = rawMessage.includes("INVALID_LOGIN_CREDENTIALS") 
            ? "Invalid credentials" 
            : rawMessage

            set({ loading: false, error: message })
            return { success: false, message }
        }
    },

    checkAuth: async (): Promise<void> => {
        set({ checkingAuth: true })
        try {
            const res = await axios.get('/auth/profile')
            set({ user: res.data.data, checkingAuth: false })
        } catch {
            set({ user: null, checkingAuth: false })
        }
    },

    LogOut: async (): Promise<void> => {
        try {
            await axios.post('/auth/signout')
            set({ user: null, justLoggedIn: false, error: null })
        } catch (error: any) {
            set({ error: error.response?.data?.message || "Logout failed" })
        }
    },

    clearError: () => set({ error: null }),
}))