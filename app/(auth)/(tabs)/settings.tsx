import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import useStore from '../../../zustand/store';

const Settings: React.FC = () => {
  const [dailyGoal, setDailyGoal] = useState<number>(5);
  const setSessions = useStore(state => state.setSessions);

  const handleSave = () => {
    if (dailyGoal < 5 || dailyGoal > 30) {
      alert('Daily goal must be between 5 and 30');
      return;
    }
    // setSessions(prevSessions => prevSessions.map(session => ({ ...session, dailyGoal })));
  };

  return (
    <View style={{marginTop: 200}}>
      <TextInput
        placeholder="Daily Goal"
        keyboardType="numeric"
        value={dailyGoal.toString()}
        onChangeText={text => setDailyGoal(Number(text))}
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

export default Settings;
