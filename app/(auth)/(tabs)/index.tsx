import { evaluateAnswer, generateEnglishLesson, transcribeAudio } from '@/api/gpt';
import { auth } from '@/firebase/firebaseConfig';
import { useAudioRecorder } from '@/utils/audio';
import { fetchLessonsFromFirebase, saveLessonToFirebase } from '@/utils/firebase';
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

  const { recording, audioUri, startRecording, stopRecording } = useAudioRecorder();

  useEffect(() => {
    if (user) {
      const fetchOrGenerateLessons = async () => {
        setLoading(true);
        let lessonList = await fetchLessonsFromFirebase(user.uid);

        if (lessonList.length === 0) {
          const newLesson = await generateEnglishLesson();
          await saveLessonToFirebase({ ...newLesson, userId: user.uid });
          lessonList.push({ ...newLesson, id: newLesson.id });
        }

        setLessons(lessonList);
        setLoading(false);
      };

      fetchOrGenerateLessons();
    }
  }, [user]);

  const handleTranscriptionSubmit = async () => {
    const evaluation = await evaluateAnswer(lessons[0].listening.questions.join(', '), transcription);
    setEvaluationResult(evaluation);
  };

  const handleWritingSubmit = async () => {
    const evaluation = await evaluateAnswer(lessons[0].writing.prompt, writingAnswer);
    setEvaluationResult(evaluation);
  };

  const handleSpeakingEvaluation = async () => {
    if (audioUri) {
      setLoading(true);
      const transcribedText = await transcribeAudio(audioUri);
      setTranscription(transcribedText);
      setLoading(false);
    } else {
      alert('Please record your voice first');
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{marginTop: 40}}>
    <ScrollView contentContainerStyle={styles.container}>
      {lessons.map((lesson) => (
        <View key={lesson.id} style={styles.lessonBlock}>
          <Text style={styles.dateText}>Date: {lesson.date}</Text>
          
          {/* Listening */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listening:</Text>
            <Text>Audio: {lesson.listening.audioUrl}</Text>
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
