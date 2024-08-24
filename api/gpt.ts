import {
  Lesson,
  ListeningLesson,
  ReadingLesson,
  SpeakingLesson,
  WritingLesson,
} from "@/utils/Lesson";
import * as FileSystem from 'expo-file-system';

const API_KEY = "";

export const generateEnglishLesson = async (): Promise<Lesson> => {
  const listeningPrompt =
    "Generate a short listening exercise for an English learner. Include a link to an audio file and three comprehension questions.";
  const readingPrompt =
    "Generate a short reading exercise for an English learner. Include a text in English and an explanation in Portuguese, along with three comprehension questions.";
  const speakingPrompt = "Generate a speaking topic for an English learner.";
  const writingPrompt = "Generate a writing prompt for an English learner.";

  const listening = await fetchGPTLesson<ListeningLesson>(listeningPrompt);
  const reading = await fetchGPTLesson<ReadingLesson>(readingPrompt);
  const speaking = await fetchGPTLesson<SpeakingLesson>(speakingPrompt);
  const writing = await fetchGPTLesson<WritingLesson>(writingPrompt);

  return {
    id: "",
    date: new Date().toISOString().split("T")[0],
    listening,
    reading,
    speaking,
    writing,
  };
};

const fetchGPTLesson = async <T>(prompt: string): Promise<T> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error fetching lesson: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  return parseLessonContent<T>(content);
};

const parseLessonContent = <T>(content: string): T => {
  return JSON.parse(content) as T;
};

export const evaluateAnswer = async (
  prompt: string,
  userAnswer: string
): Promise<string> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that evaluates English learners' answers.",
        },
        {
          role: "user",
          content: `Evaluate the following answer based on this prompt: "${prompt}". The answer is: "${userAnswer}".`,
        },
      ],
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error evaluating answer: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const transcribeAudio = async (audioFileUri: string): Promise<string> => {
  const fileInfo = await FileSystem.getInfoAsync(audioFileUri);

  // Crie um objeto FormData
  const formData = new FormData();

  // Adicione o arquivo de áudio ao FormData
  formData.append('file', {
    uri: fileInfo.uri,
    name: 'audio.mp3',
    type: 'audio/mpeg'
  } as any);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error transcribing audio: ${response.statusText}`);
  }

  const data = await response.json();
  return data.text;
};