import { evaluateAnswer, generateEnglishLesson, transcribeAudio } from '@/api/gpt';
import { auth } from '@/firebase/firebaseConfig';
import { useAudioRecorder } from '@/utils/audio';
import { fetchLessonsFromFirebase, saveLessonToFirebase } from '@/utils/firebase';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
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
      try {
        const transcribedText = await transcribeAudio(audioUri);
        setTranscription(transcribedText);
      } catch (error) {
        console.error("Error transcribing audio:", error);
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
    <ScrollView>
      {lessons.map((lesson) => (
        <View key={lesson.id}>
          <Text>Date: {lesson.date}</Text>
          
          {/* Listening */}
          <Text>Listening:</Text>
          <Text>Audio: {lesson.listening.audioUrl}</Text>
          <Text>Questions: {lesson.listening.questions.join(', ')}</Text>
          <TextInput 
            placeholder="Type what you hear..." 
            value={transcription}
            onChangeText={setTranscription}
          />
          <Button title="Submit Transcription" onPress={handleTranscriptionSubmit} />
          {evaluationResult && <Text>Evaluation: {evaluationResult}</Text>}

          {/* Reading */}
          <Text>Reading:</Text>
          <Text>{lesson.reading.text}</Text>
          <Text>Explanation: {lesson.reading.explanation}</Text>

          {/* Speaking */}
          <Text>Speaking:</Text>
          <Text>{lesson.speaking.topic}</Text>
          <Button title="Evaluate Speaking" onPress={handleSpeakingEvaluation} />
          {evaluationResult && <Text>Score: {evaluationResult}/100</Text>}

          {/* Writing */}
          <Text>Writing:</Text>
          <Text>{lesson.writing.prompt}</Text>
          <TextInput 
            placeholder="Write your text here..." 
            value={writingAnswer}
            onChangeText={setWritingAnswer}
          />
          <Button title="Submit Writing" onPress={handleWritingSubmit} />
          {evaluationResult && <Text>Evaluation: {evaluationResult}</Text>}
        </View>
      ))}
      <Button title="Log Out" onPress={() => auth.signOut()} />
    </ScrollView>
  );
};

export default HomeScreen;
