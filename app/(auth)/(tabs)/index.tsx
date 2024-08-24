import { fetchGPTLessons } from '@/api/gpt';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { auth, firestore } from '../../../firebase/firebaseConfig';
import useStore from '../../../zustand/store';

const HomeScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const lessons = useStore(state => state.lessons);
  const setLessons = useStore(state => state.setLessons);
  const user = useStore(state => state.user);

  useEffect(() => {
    if (user) {
      const fetchLessons = async () => {
        try {
          setLoading(true);
          const lessonList: any[] = [];
          const q = query(collection(firestore, 'lessons'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          
          console.log('Snapshot received:', snapshot);
          
          if (!snapshot.empty) {
            snapshot.forEach(doc => {
              console.log('Document data:', doc.data());
              lessonList.push({ id: doc.id, ...doc.data() });
            });
            setLessons(lessonList);
          } else {
            console.log('No documents found, fetching new lessons from GPT-3 API');
            // Fetch new lessons from GPT-3 API
            const newLesson = await fetchGPTLessons();
            const newLessonDoc = {
              userId: user.uid,
              content: newLesson,
            };
            const lessonDocRef = doc(collection(firestore, 'lessons'));
            await setDoc(lessonDocRef, newLessonDoc);
            lessonList.push({ id: lessonDocRef.id, ...newLessonDoc });
            setLessons(lessonList);
          }
        } catch (error) {
          console.error('Error fetching lessons:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchLessons();
    }
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    setLessons([]); // Clear lessons on logout
  };

  return (
    <View style={{marginTop: 200}}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text>Lessons for today:</Text>
          {lessons.map(lesson => (
            <Text key={lesson.id}>{lesson.content}</Text>
          ))}
          <Button title="Log Out" onPress={handleLogout} />
        </>
      )}
    </View>
  );
};

export default HomeScreen;
