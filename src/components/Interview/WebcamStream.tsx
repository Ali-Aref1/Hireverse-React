import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useSpring, animated } from "@react-spring/web";

interface WebcamStreamProps {
  socket: Socket;
  userId: string;
}

const WEBCAM_WIDTH = 340;
const WEBCAM_HEIGHT = 240; // Adjust if needed

const WebcamStream: React.FC<WebcamStreamProps> = ({ socket, userId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Drag state
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Committed position state
  const [committedPos, setCommittedPos] = useState({
    x: window.innerWidth - WEBCAM_WIDTH - 24,
    y: 24,
  });

  // Spring for position
  const [{ x, y }, api] = useSpring(() => ({
    x: window.innerWidth - WEBCAM_WIDTH - 24,
    y: 24,
    config: { tension: 300, friction: 30 },
  }));

  // Helper to get bounds
  const getBoundedPosition = (clientX: number, clientY: number) => {
    const minX = 0;
    const minY = 0;
    const maxX = window.innerWidth - WEBCAM_WIDTH;
    const maxY = window.innerHeight - WEBCAM_HEIGHT;
    let newX = clientX - dragOffset.current.x;
    let newY = clientY - dragOffset.current.y;
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));
    return { x: newX, y: newY };
  };

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get the current animated position
    const currentX = x.get();
    const currentY = y.get();
    // Commit the spring to the current position before starting drag
    api.start({ x: currentX, y: currentY, immediate: true });
    setCommittedPos({ x: currentX, y: currentY });
    setDragging(true);
    // Use the current position for drag offset
    dragOffset.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    };
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const bounded = getBoundedPosition(e.clientX, e.clientY);
        api.start({ x: bounded.x, y: bounded.y });
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      setDragging(false);
      document.body.style.userSelect = "";
      const bounded = getBoundedPosition(e.clientX, e.clientY);
      setCommittedPos(bounded); // <-- Save the last position
      api.start({ x: bounded.x, y: bounded.y });
    };
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
    };
  }, [dragging, api]);

  // Keep the spring in sync with committedPos (e.g. on mount)
  useEffect(() => {
    api.start({ x: committedPos.x, y: committedPos.y });
  }, [committedPos, api]);

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
    <animated.div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 10,
        cursor: dragging ? "grabbing" : "grab",
        width: WEBCAM_WIDTH,
        height: WEBCAM_HEIGHT,
        userSelect: "none",
        touchAction: "none",
      }}
      onMouseDown={onMouseDown}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: WEBCAM_WIDTH - 20, borderRadius: 8, pointerEvents: "none" }}
      />
    </animated.div>
  );
};

export default WebcamStream;