import { Lesson, ListeningLesson, ReadingLesson } from "@/utils/Lesson";
import * as FileSystem from "expo-file-system";

const API_KEY = "";

const readingPrompt =
  "Generate a short reading exercise for an English learner. Include a text in English and an explanation in Portuguese, along with three comprehension questions.";
const speakingPrompt = "Generate a speaking topic for an English learner.";
const writingPrompt = "Generate a writing prompt for an English learner.";
const listeningPrompt = `
For this listening exercise, please listen to the following audio and answer the questions below.

Audio File: [She tried to persuade him to retire, but he would have none of it.](https://www.mairovergara.com/wp-content/uploads/2024/07/1-She-tried-to-persuade.mp3)

Transcription: "She tried to persuade him to retire, but he would have none of it."

After listening, answer these questions:

1. What did she try to persuade him to do?
2. How did he respond to her suggestion?
3. Why do you think he didn't want to retire?
`;

export const generateEnglishLesson = async (): Promise<Lesson> => {
  try {
    const listening = {
      audioUrl:
        "https://www.mairovergara.com/wp-content/uploads/2024/07/1-She-tried-to-persuade.mp3",
      questions: [
        "What did she try to persuade him to do?",
        "How did he respond to her suggestion?",
        "Why do you think he didn't want to retire?",
      ],
    };

    const readingContent = await fetchGPTLesson<string>(readingPrompt);
    const speakingContent = await fetchGPTLesson<string>(speakingPrompt);
    const writingContent = await fetchGPTLesson<string>(writingPrompt);

    const reading = parseReadingLessonContent(readingContent);
    const speaking = { topic: speakingContent };
    const writing = { prompt: writingContent };

    return {
      id: "",
      date: new Date().toISOString().split("T")[0],
      listening,
      reading,
      speaking,
      writing,
    };
  } catch (error) {
    console.error("Error generating English lesson:", error);
    throw error;
  }
};

const fetchGPTLesson = async <T>(prompt: string): Promise<T> => {
  console.log("Fetching GPT lesson...");
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

  console.log("Fetched lesson content:", content);

  return content as unknown as T;
};

const parseListeningLessonContent = (content: string): ListeningLesson => {
  const lines = content.split("\n");
  const audioUrl = lines[1].match(/\(([^)]+)\)/)?.[1] || "";
  const questions = lines
    .slice(4)
    .map((line) => line.trim().replace(/\d+\. /, ""));

  return {
    audioUrl,
    questions,
  };
};

const parseReadingLessonContent = (content: string): ReadingLesson => {
  const lines = content.split("\n");
  const text = lines[0].replace("Text:", "").trim();
  const explanation = lines[1].replace("Explanation:", "").trim();
  const questions = lines
    .slice(3)
    .map((line) => line.trim().replace(/\d+\. /, ""));

  return {
    text,
    explanation,
    questions,
  };
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
  try {
    const fileInfo = await FileSystem.getInfoAsync(audioFileUri);

    const formData = new FormData();
    formData.append("file", {
      uri: fileInfo.uri,
      name: "audio.m4a",
      type: "audio/m4a",
    } as any);

    formData.append("model", "whisper-1");
    formData.append("language", "en");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Transcription API Error:', response.status, errorText);
      throw new Error(`Error transcribing audio: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Transcription result:', data.text);
    return data.text;
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw error;
  }
};

