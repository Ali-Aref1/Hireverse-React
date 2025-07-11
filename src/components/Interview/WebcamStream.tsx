import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface WebcamStreamProps {
  socket: Socket;
  userId: string;
}

const WEBCAM_WIDTH = 340;
const WEBCAM_HEIGHT = 240;

const WebcamStream: React.FC<WebcamStreamProps> = ({ socket, userId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Drag state
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  // Get position from localStorage or use default (bottom left)
  const getInitialPosition = () => {
    try {
      const saved = localStorage.getItem('webcam-position');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate the saved position is still within bounds
        const maxX = window.innerWidth - WEBCAM_WIDTH;
        const maxY = window.innerHeight - WEBCAM_HEIGHT;
        if (parsed.x >= 0 && parsed.x <= maxX && parsed.y >= 0 && parsed.y <= maxY) {
          return parsed;
        }
      }
    } catch (e) {
      // If localStorage fails, fall back to default
    }
    
    // Default position: bottom left
    return {
      x: 24,
      y: window.innerHeight - WEBCAM_HEIGHT - 24,
    };
  };
  
  const initialPosition = getInitialPosition();
  
  // Track actual position using ref - this is our single source of truth
  const position = useRef(initialPosition);

  // Position state for triggering rerenders only when needed
  const [cssPosition, setCssPosition] = useState(initialPosition);

  // Save position to localStorage
  const savePosition = (pos: { x: number; y: number }) => {
    try {
      localStorage.setItem('webcam-position', JSON.stringify(pos));
    } catch (e) {
      // localStorage might be disabled, fail silently
    }
  };

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
    // Use the position ref as single source of truth
    const currentPos = position.current;
    setDragging(true);
    // Use the current position for drag offset
    dragOffset.current = {
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    };
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const bounded = getBoundedPosition(e.clientX, e.clientY);
        position.current = bounded;
        setCssPosition(bounded);
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      setDragging(false);
      document.body.style.userSelect = "";
      const bounded = getBoundedPosition(e.clientX, e.clientY);
      position.current = bounded;
      setCssPosition(bounded);
      savePosition(bounded); // Save position when drag ends
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
  }, [dragging]);

  // Handle window resize to keep webcam in bounds
  useEffect(() => {
    const handleResize = () => {
      const currentPos = position.current;
      const maxX = window.innerWidth - WEBCAM_WIDTH;
      const maxY = window.innerHeight - WEBCAM_HEIGHT;
      
      // Check if current position is out of bounds
      if (currentPos.x > maxX || currentPos.y > maxY) {
        const newX = Math.max(0, Math.min(currentPos.x, maxX));
        const newY = Math.max(0, Math.min(currentPos.y, maxY));
        const newPos = { x: newX, y: newY };
        
        // Update position and trigger rerender
        position.current = newPos;
        setCssPosition(newPos);
        savePosition(newPos); // Save adjusted position
        
        console.log("[WebcamStream] Position adjusted due to resize:", newPos);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              event.data.arrayBuffer().then(buffer => {
                socket.emit("video_chunk", { userId, chunk: Array.from(new Uint8Array(buffer)) });
              });
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
    <div
      style={{
        position: "absolute",
        left: cssPosition.x,
        top: cssPosition.y,
        zIndex: 10,
        cursor: dragging ? "grabbing" : "grab",
        width: WEBCAM_WIDTH,
        height: WEBCAM_HEIGHT,
        userSelect: "none",
        touchAction: "none",
        transition: dragging ? "none" : "all 0.2s ease-out", // Smooth transitions when not dragging
      }}
      onMouseDown={onMouseDown}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: WEBCAM_WIDTH - 20, borderRadius: 8, pointerEvents: "none" }}
      />
    </div>
  );
};

export default WebcamStream;