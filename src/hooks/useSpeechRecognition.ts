import { useEffect, useState, Dispatch, SetStateAction } from "react";

let recognition: any = null;
if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
}

export const useSpeechRecognition = (
    text: string,
    setText: Dispatch<SetStateAction<string>>,
    onSend?: (text: string) => void
) => {
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join(" ");
            setText(transcript);
            recognition.stop();
            setIsListening(false);
            if (onSend) onSend(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

    }, [onSend, setText]);

    const startListening = () => {
        setText(""); // Clear the text before starting
        setIsListening(true);
        recognition.start();
    };

    const stopListening = () => {
        setIsListening(false);
        recognition.stop();
        if (onSend && text.trim() !== "") {
            onSend(text);
        }
    };

    return {
        isListening,
        startListening,
        stopListening,
        hasRecognitionSupport: !!recognition,
    };
};
