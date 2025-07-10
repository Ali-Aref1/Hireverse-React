export interface Interview {
    _id: string; // Mongoose document ID (optional if not always present)
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
    };
}
