import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface WebcamStreamProps {
  socket: Socket;
  userId: string;
  connectionQuality?: 'good' | 'poor' | 'disconnected';
}

const WEBCAM_WIDTH = 240;
const WEBCAM_HEIGHT = 190;

const WebcamStream: React.FC<WebcamStreamProps> = ({ socket, userId, connectionQuality = 'good' }) => {
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
    let chunkQueue: Blob[] = [];
    let isProcessingQueue = false;

    const processChunkQueue = async () => {
      if (isProcessingQueue || chunkQueue.length === 0) return;
      isProcessingQueue = true;

      try {
        // Process chunks in smaller batches to maintain order
        const batchSize = Math.min(3, chunkQueue.length);
        const batch = chunkQueue.splice(0, batchSize);
        
        for (const chunk of batch) {
          if (chunk && chunk.size > 0) {
            try {
              const buffer = await chunk.arrayBuffer();
              
              // Validate buffer is not corrupted
              if (buffer.byteLength === 0) {
                console.warn("[WebRTC] Skipping empty buffer");
                continue;
              }
              
              socket.emit("video_chunk", { 
                userId, 
                chunk: Array.from(new Uint8Array(buffer)),
                timestamp: Date.now() // Add timestamp for ordering
              });
              
              // Small delay to prevent overwhelming the socket and maintain order
              await new Promise(resolve => setTimeout(resolve, 5));
            } catch (err) {
              console.error("[WebRTC] Error processing chunk:", err);
            }
          }
        }
      } catch (error) {
        console.error("[WebRTC] Error in chunk processing:", error);
      } finally {
        isProcessingQueue = false;
        
        // Continue processing if there are more chunks
        if (chunkQueue.length > 0) {
          setTimeout(processChunkQueue, 10);
        }
      }
    };

    const startWebcamAndStream = async () => {
      try {
        // Adapt constraints based on connection quality
        const getConstraints = () => {
          switch (connectionQuality) {
            case 'poor':
              return {
                video: {
                  width: { ideal: 320, max: 640 },
                  height: { ideal: 240, max: 480 },
                  frameRate: { ideal: 10, max: 15 }
                },
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                  sampleRate: 16000 // Even lower sample rate for poor connections
                }
              };
            case 'disconnected':
              return null; // Don't start stream if disconnected
            default: // 'good'
              return {
                video: {
                  width: { ideal: 640, max: 1280 },
                  height: { ideal: 480, max: 720 },
                  frameRate: { ideal: 15, max: 24 }
                },
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                  sampleRate: 22050
                }
              };
          }
        };

        const constraints = getConstraints();
        if (!constraints) {
          console.log("[WebRTC] Skipping stream start due to disconnected state");
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Configure peer connection with bandwidth constraints
        const peer = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerRef.current = peer;

        // Add bandwidth constraints based on connection quality
        const getBitrateSettings = () => {
          switch (connectionQuality) {
            case 'poor':
              return {
                video: 150000, // 150 kbps
                audio: 32000,  // 32 kbps
                recording: {
                  videoBitsPerSecond: 100000, // 100 kbps
                  audioBitsPerSecond: 32000   // 32 kbps
                },
                chunkInterval: 2000 // 2 second chunks for poor connections
              };
            default: // 'good'
              return {
                video: 500000, // 500 kbps
                audio: 64000,  // 64 kbps
                recording: {
                  videoBitsPerSecond: 250000, // 250 kbps
                  audioBitsPerSecond: 64000   // 64 kbps
                },
                chunkInterval: 1000 // 1 second chunks for good connections
              };
          }
        };

        const bitrateSettings = getBitrateSettings();

        // Add bandwidth constraints
        const sender = peer.addTrack(stream.getVideoTracks()[0], stream);
        const params = sender.getParameters();
        if (!params.encodings) params.encodings = [{}];
        params.encodings[0].maxBitrate = bitrateSettings.video;
        await sender.setParameters(params);

        // Create DataChannel for video chunks with optimized settings
        const dataChannel = peer.createDataChannel("videoChunks", {
          ordered: false, // Allow out-of-order delivery for better performance
          maxRetransmits: 0 // Don't retransmit lost packets
        });
        dataChannelRef.current = dataChannel;

        dataChannel.onopen = () => {
          console.log("[WebRTC] DataChannel is open, starting MediaRecorder");
          
          // Use more stable recording settings
          const options = {
            mimeType: "video/webm; codecs=vp9,opus", // Use VP9 + Opus for better quality
            videoBitsPerSecond: bitrateSettings.recording.videoBitsPerSecond,
            audioBitsPerSecond: bitrateSettings.recording.audioBitsPerSecond
          };

          try {
            mediaRecorder = new MediaRecorder(stream, options);
          } catch (err) {
            // Fallback to VP8 if VP9 is not supported
            console.warn("[WebRTC] VP9 not supported, falling back to VP8:", err);
            try {
              const fallbackOptions = {
                mimeType: "video/webm; codecs=vp8,opus",
                videoBitsPerSecond: bitrateSettings.recording.videoBitsPerSecond,
                audioBitsPerSecond: bitrateSettings.recording.audioBitsPerSecond
              };
              mediaRecorder = new MediaRecorder(stream, fallbackOptions);
            } catch (fallbackErr) {
              // Final fallback to default settings
              console.warn("[WebRTC] Custom options failed, using defaults:", fallbackErr);
              mediaRecorder = new MediaRecorder(stream);
            }
          }

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              // Validate chunk before adding to queue
              if (event.data.size < 10) {
                console.warn("[WebRTC] Skipping very small chunk:", event.data.size);
                return;
              }
              chunkQueue.push(event.data);
              processChunkQueue();
            }
          };

          mediaRecorder.onerror = (event) => {
            console.error("[WebRTC] MediaRecorder error:", event);
          };

          mediaRecorder.onstart = () => {
            console.log("[WebRTC] MediaRecorder started");
          };

          mediaRecorder.onstop = () => {
            console.log("[WebRTC] MediaRecorder stopped");
          };

          // Use adaptive chunk interval based on connection quality
          console.log(`[WebRTC] Starting recording with ${bitrateSettings.chunkInterval}ms intervals`);
          mediaRecorder.start(bitrateSettings.chunkInterval);
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
          
          // Clear any remaining chunks
          chunkQueue = [];
          
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
        console.error("[WebRTC] Error accessing webcam/microphone:", err);
        alert("Could not access webcam/microphone. Please check your permissions.");
      }
    };

    startWebcamAndStream();

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
    // eslint-disable-next-line
  }, [socket, userId, connectionQuality]);

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
        style={{ width: WEBCAM_WIDTH - 16, height: WEBCAM_HEIGHT - 16, borderRadius: 8, pointerEvents: "none" }}
      />
    </div>
  );
};

export default WebcamStream;