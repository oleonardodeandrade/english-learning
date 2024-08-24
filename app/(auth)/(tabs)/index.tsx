import { evaluateAnswer, generateEnglishLesson, transcribeAudio } from '@/api/gpt';
import { auth } from '@/firebase/firebaseConfig';
import { useAudioRecorder } from '@/utils/audio';
import { fetchLessonsFromFirebase, saveLessonToFirebase } from '@/utils/firebase';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import useStore from '../../../zustand/store';

const HomeScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const lessons = useStore(state => state.lessons);
  const setLessons = useStore(state => state.setLessons);
  const user = useStore(state => state.user);
  const [transcription, setTranscription] = useState('');
  const [writingAnswer, setWritingAnswer] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const { recording, audioUri, startRecording, stopRecording } = useAudioRecorder();

  useEffect(() => {
    if (user) {
      const fetchOrGenerateLessons = async () => {
        try {
          setLoading(true);
          console.log('Fetching lessons from Firebase...');
          let lessonList = await fetchLessonsFromFirebase(user.uid);

          if (lessonList.length === 0) {
            console.log('No lessons found, generating new lessons...');
            const newLesson = await generateEnglishLesson();
            console.log('Generated new lesson:', newLesson);
            await saveLessonToFirebase({ ...newLesson, userId: user.uid });
            lessonList.push({ ...newLesson, id: newLesson.id });
          }

          setLessons(lessonList);
        } catch (error) {
          console.error('Error in fetchOrGenerateLessons:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchOrGenerateLessons();
    }
  }, [user]);

  const handlePlaySound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: lessons[0]?.listening.audioUrl }
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleStopSound = async () => {
    if (sound) {
      await sound.stopAsync();
    }
  };

  const handleTranscriptionSubmit = async () => {
    try {
      console.log('Submitting transcription for evaluation...');
      const evaluation = await evaluateAnswer(lessons[0].listening.questions.join(', '), transcription);
      setEvaluationResult(evaluation);
      console.log('Evaluation result:', evaluation);
    } catch (error) {
      console.error('Error in handleTranscriptionSubmit:', error);
    }
  };

  const handleWritingSubmit = async () => {
    try {
      console.log('Submitting writing for evaluation...');
      const evaluation = await evaluateAnswer(lessons[0].writing.prompt, writingAnswer);
      setEvaluationResult(evaluation);
      console.log('Evaluation result:', evaluation);
    } catch (error) {
      console.error('Error in handleWritingSubmit:', error);
    }
  };

  const handleSpeakingEvaluation = async () => {
    if (audioUri) {
      try {
        setLoading(true);
        console.log('Transcribing audio...');
        const transcribedText = await transcribeAudio(audioUri);
        setTranscription(transcribedText);
        console.log('Transcription result:', transcribedText);
      } catch (error) {
        console.error('Error in handleSpeakingEvaluation:', error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please record your voice first');
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{ marginTop: 40 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {lessons.map((lesson) => (
          <View key={lesson.id} style={styles.lessonBlock}>
            <Text style={styles.dateText}>Date: {lesson.date}</Text>

            {/* Listening */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Listening:</Text>
              <Button title="Play Audio" onPress={handlePlaySound} />
              <Button title="Stop Audio" onPress={handleStopSound} />
              <Text>Questions: {lesson.listening.questions.join(', ')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Type what you hear..."
                value={transcription}
                onChangeText={setTranscription}
              />
              <Button title="Submit Transcription" onPress={handleTranscriptionSubmit} />
              {evaluationResult && <Text>Evaluation: {evaluationResult}</Text>}
            </View>

            {/* Reading */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reading:</Text>
              <Text>{lesson.reading.text}</Text>
              <Text>Explanation: {lesson.reading.explanation}</Text>
            </View>

            {/* Speaking */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Speaking:</Text>
              <Text>{lesson.speaking.topic}</Text>
              <Button title="Evaluate Speaking" onPress={handleSpeakingEvaluation} />
              {evaluationResult && <Text>Score: {evaluationResult}/100</Text>}
            </View>

            {/* Writing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Writing:</Text>
              <Text>{lesson.writing.prompt}</Text>
              <TextInput
                style={styles.input}
                placeholder="Write your text here..."
                value={writingAnswer}
                onChangeText={setWritingAnswer}
              />
              <Button title="Submit Writing" onPress={handleWritingSubmit} />
              {evaluationResult && <Text>Evaluation: {evaluationResult}</Text>}
            </View>
          </View>
        ))}
        <Button title="Log Out" onPress={() => auth.signOut()} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  lessonBlock: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});

export default HomeScreen;
