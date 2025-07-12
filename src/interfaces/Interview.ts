export interface Interview {
    _id: string; // Mongoose document ID (optional if not always present)
    name?: string;
    user_id: string;
    duration: number;
    video_path: string;
    time: Date;
    messages: {
        sender: string;
        message: string;
        phase: string;
    }[];
    eval: {
        behavioural: {
            score: number;
            feedback: string;
        }; 
        technical: {
            score: number;
            feedback: string;
        };
        coding: {
            score: number;
            feedback: string;
        };
        FPL_scores?: {
            EngagingTone: number;
            RecommendHiring: number;
            Friendly: number;
            Colleague: number;
            NoFillers: number;
            Excited: number;
            Calm: number;
            NotAwkward: number;
            NotStressed: number;
        };
        emotion?: {
            dominant_emotion: string;
            dominant_percentage: number;
            total_messages_analyzed: number;
            emotion_breakdown: {
                sadness: number;
                happiness: number;
                anger: number;
                fear: number;
                surprise: number;
                neutral: number;
            };
        };
    };
}
export interface Message {
  sender: string;
  message: string | { response: string };
  eval?: any; // Optional property for evaluation data
  phase?: string; // Optional property to indicate the phase of the interview
  audio?: Blob; // Optional property for audio data
  isCode?: boolean; // Optional property to indicate if the message is code
  transition?: boolean; // Optional property to indicate if the message is a transition message
}
