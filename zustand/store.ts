import { Lesson } from '@/utils/Lesson';
import { User } from 'firebase/auth';
import { create } from 'zustand';

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
  lessons: Lesson[];
  setLessons: (lessons: Lesson[]) => void;
}

const useStore = create<StoreState>(set => ({
  user: null,
  setUser: (user) => set({ user }),
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  lessons: [],
  setLessons: (lessons) => set({ lessons }),
}));

export default useStore;
