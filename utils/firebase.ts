import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { Lesson } from './Lesson';

export const saveLessonToFirebase = async (lesson: Lesson) => {
  const lessonDocRef = doc(collection(firestore, 'lessons'));
  lesson.id = lessonDocRef.id;
  await setDoc(lessonDocRef, lesson);
};

export const fetchLessonsFromFirebase = async (userId: string): Promise<Lesson[]> => {
  const q = query(collection(firestore, 'lessons'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const lessons: Lesson[] = [];
  snapshot.forEach(doc => lessons.push({ id: doc.id, ...doc.data() } as Lesson));
  return lessons;
};
