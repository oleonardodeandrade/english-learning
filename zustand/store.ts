import { create } from 'zustand';
import { User } from 'firebase/auth';

interface Session {
  id: string;
  name: string;
  dailyGoal: number;
}

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
}

const useStore = create<StoreState>(set => ({
  user: null,
  setUser: (user) => set({ user }),
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
}));

export default useStore;
