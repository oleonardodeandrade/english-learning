export interface ListeningLesson {
  audioUrl: string;
  questions: string[];
}

export interface ReadingLesson {
  text: string;
  explanation: string;
}

export interface SpeakingLesson {
  topic: string;
}

export interface WritingLesson {
  prompt: string;
}

export interface Lesson {
  id: string;
  date: string;
  userId?: string;
  listening: ListeningLesson;
  reading: ReadingLesson;
  speaking: SpeakingLesson;
  writing: WritingLesson;
}
