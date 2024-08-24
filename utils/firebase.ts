import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { Lesson } from './Lesson';

export const saveLessonToFirebase = async (lesson: Lesson) => {
  try {
    const lessonDocRef = doc(collection(firestore, 'lessons'));
    lesson.id = lessonDocRef.id;
    await setDoc(lessonDocRef, lesson);
    console.log('Lesson saved to Firebase:', lesson);
  } catch (error) {
    console.error('Error saving lesson to Firebase:', error);
  }
};

export const fetchLessonsFromFirebase = async (userId: string): Promise<Lesson[]> => {
  try {
    const q = query(collection(firestore, 'lessons'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const lessons: Lesson[] = [];
    snapshot.forEach(doc => lessons.push({ id: doc.id, ...doc.data() } as Lesson));
    console.log('Lessons fetched from Firebase:', lessons);
    return lessons;
  } catch (error) {
    console.error('Error fetching lessons from Firebase:', error);
    return [];
  }
};
