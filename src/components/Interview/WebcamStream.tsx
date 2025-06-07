import React, { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

interface WebcamStreamProps {
  socket: Socket;
  userId: string;
}

const WebcamStream: React.FC<WebcamStreamProps> = ({ socket, userId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let stream: MediaStream;
    let mediaRecorder: MediaRecorder;
    let stopped = false;

    const startWebcamAndStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const peer = new RTCPeerConnection();
        peerRef.current = peer;

        // Create DataChannel for video chunks
        const dataChannel = peer.createDataChannel("videoChunks");
        dataChannelRef.current = dataChannel;

        dataChannel.onopen = () => {
          console.log("[WebRTC] DataChannel is open, starting MediaRecorder");
          mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8,opus" });

          mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0) {
              if (dataChannel.readyState === "open") {
                const arrayBuffer = await event.data.arrayBuffer();
                dataChannel.send(arrayBuffer);
              } else {
                console.warn("[WebRTC] Tried to send chunk but DataChannel is not open. State:", dataChannel.readyState);
              }
            }
          };

          mediaRecorder.start(500); // 500ms chunks
        };

        // WebRTC signaling via Socket.IO
        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc_ice_candidate", { userId, candidate: event.candidate });
          }
        };

        // Listen for answer from server
        const answerListener = async ({ answer }: any) => {
          if (peerRef.current && answer) {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          }
        };
        socket.on("webrtc_answer", answerListener);

        // Listen for ICE candidates from server
        const iceListener = async ({ candidate }: any) => {
          if (peerRef.current && candidate) {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        };
        socket.on("webrtc_ice_candidate", iceListener);

        // Create offer and send to server
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        console.log("[WebRTC] Emitting webrtc_offer", { userId, offer });
        socket.emit("webrtc_offer", { userId, offer });

        // Cleanup function
        cleanupRef.current = () => {
          if (stopped) return;
          stopped = true;
          if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            // Delay closing the peer connection to allow the end message to be sent
            setTimeout(() => {
              if (peerRef.current) {
                peerRef.current.close();
              }
              if (stream) {
                stream.getTracks().forEach((track) => track.stop());
              }
              socket.off("webrtc_answer", answerListener);
              socket.off("webrtc_ice_candidate", iceListener);
            }, 500); // 500ms delay to ensure end message is sent
          } else {
            if (peerRef.current) {
              peerRef.current.close();
            }
            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
            }
            socket.off("webrtc_answer", answerListener);
            socket.off("webrtc_ice_candidate", iceListener);
          }
        };
      } catch (err) {
        alert("Could not access webcam/microphone.");
      }
    };

    startWebcamAndStream();

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
    // eslint-disable-next-line
  }, [socket, userId]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: 320, borderRadius: 8 }} />
    </div>
  );
};

export default WebcamStream;