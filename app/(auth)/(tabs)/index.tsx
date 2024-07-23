import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import useStore from '../../../zustand/store';
import { firestore, auth } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const HomeScreen: React.FC = () => {
  const sessions = useStore(state => state.sessions);
  const setSessions = useStore(state => state.setSessions);
  const setUser = useStore(state => state.setUser);
  const user = useStore(state => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchSessions = async () => {
        const sessionList: any[] = [];
        const q = query(collection(firestore, 'sessions'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => sessionList.push({ id: doc.id, ...doc.data() }));
        setSessions(sessionList);
      };

      fetchSessions();
    }
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    router.replace('/');
  };

  return (
    <View style={{marginTop: 200}}>
      <Text>Sessions for today:</Text>
      {sessions.map(session => (
        <Text key={session.id}>{session.name}</Text>
      ))}
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
