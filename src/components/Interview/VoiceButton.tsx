import { FaMicrophone } from "react-icons/fa";

interface VoiceButtonProps {
    onClick?: () => void;
    className?: string;
    isListening?: boolean;
    loading?: boolean;
    interviewerSpeaking?: boolean; // Optional property to indicate if the interviewer is speaking
}

export const VoiceButton = ({onClick,className,isListening,loading, interviewerSpeaking}:VoiceButtonProps) => {
  return (
    <button
      className={`flex items-center justify-center bg-blue-500 text-white transition-all w-fit h-fit rounded-full p-4 ${className} ${isListening ? "scale-110 shadow-[0_0_24px_8px_rgba(96,165,250,0.7)] animate-pulse" : ""} ${(loading|| interviewerSpeaking) ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-blue-600"}`}
      onClick={onClick}
      disabled={loading || interviewerSpeaking}
    >
      <FaMicrophone
        className="w-12 h-12"
      />
    </button>
  )
}
