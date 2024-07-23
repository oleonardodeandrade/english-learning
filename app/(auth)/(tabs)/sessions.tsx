import React from 'react';
import { View, Text } from 'react-native';

const Sessions: React.FC = () => {
  const sessions = ['Listening', 'Speaking', 'Reading', 'Writing'];

  return (
    <View style={{marginTop: 200}}>
      {sessions.map(session => (
        <View key={session}>
          <Text>{session}</Text>
        </View>
      ))}
    </View>
  );
}

export default Sessions;
