import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import useStore from '../../../zustand/store';
import { firestore, auth } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const HomeScreen: React.FC = () => {
  const sessions = useStore(state => state.sessions);
  const setSessions = useStore(state => state.setSessions);
  const user = useStore(state => state.user);

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

  return (
    <View>
      <Text>Sessions for today:</Text>
      {sessions.map(session => (
        <Text key={session.id}>{session.name}</Text>
      ))}
      <Button title="Log Out" onPress={() => auth.signOut()} />
    </View>
  );
};

export default HomeScreen;
