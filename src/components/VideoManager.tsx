
import React, { useState, useRef, useEffect } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { startVideoRecording, stopVideoRecording, loanApplicationQuestions } from '@/utils/videoUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Video, Pause, Play, StopCircle, Loader, Send, RefreshCw } from 'lucide-react';

const VideoManager: React.FC = () => {
  const { toast } = useToast();
  const {
    status,
    setStatus,
    currentQuestion,
    setCurrentQuestion,
    addVideoResponse,
    customerName,
    setCustomerName,
  } = useApplication();

  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaState, setMediaState] = useState<{
    stream: MediaStream | null;
    recorder: MediaRecorder | null;
    chunks: BlobPart[];
  }>({
    stream: null,
    recorder: null,
    chunks: [],
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const currentQuestionData = loanApplicationQuestions[currentQuestion];
  const maxDuration = currentQuestionData?.maxDuration || 60;

  useEffect(() => {
    if (status === 'video_intro' || status === 'video_questions') {
      initializeCamera();
    }

    return () => {
      stopCamera();
    };
  }, [status]);

  // Update preview video when previewUrl changes
  useEffect(() => {
    if (previewRef.current && previewUrl) {
      previewRef.current.src = previewUrl;
      previewRef.current.load();
    }
  }, [previewUrl]);

  // Handle recording countdown
  useEffect(() => {
    if (countdown > 0 && countdown <= 3) {
      countdownRef.current = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      startRecording();
      setCountdown(-1);
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const { stream, recorder, chunks } = await startVideoRecording();
      setMediaState({ stream, recorder, chunks });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (mediaState.stream) {
      mediaState.stream.getTracks().forEach(track => track.stop());
    }
    setMediaState({ stream: null, recorder: null, chunks: [] });
  };

  const startCountdown = () => {
    setCountdown(3);
    setPreviewUrl(null);
  };

  const startRecording = () => {
    if (!mediaState.recorder) return;

    mediaState.recorder.start();
    setRecording(true);
    setElapsedTime(0);

    // Start timer to track elapsed recording time
    timerRef.current = window.setInterval(() => {
      setElapsedTime(prevTime => {
        const newTime = prevTime + 1;
        if (newTime >= maxDuration) {
          stopRecording();
          return maxDuration;
        }
        return newTime;
      });
    }, 1000);
  };

  const stopRecording = async () => {
    if (!mediaState.recorder || !mediaState.stream) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const videoBlob = await stopVideoRecording(mediaState);
      const url = URL.createObjectURL(videoBlob);
      setPreviewUrl(url);
      setRecording(false);

      // Store the response if we're not just previewing
      if (status === 'video_questions') {
        addVideoResponse({
          questionId: currentQuestionData.id,
          videoBlob,
        });
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast({
        title: "Recording Error",
        description: "There was a problem with the recording. Please try again.",
        variant: "destructive",
      });
      setRecording(false);
    }
  };

  const handleSubmitRecording = () => {
    if (status === 'video_intro') {
      // If it's the intro, move to document upload
      setStatus('document_upload');
    } else if (status === 'video_questions') {
      // If it's a question, move to the next question or to processing
      if (currentQuestion < loanApplicationQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setPreviewUrl(null);
      } else {
        setStatus('processing');
      }
    }
  };

  const handleReRecord = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    startCountdown();
  };

  const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(event.target.value);
  };

  const renderVideoInstructions = () => {
    if (status === 'video_intro') {
      return (
        <div className="text-center max-w-md mx-auto mb-6 animate-fade-in">
          <h3 className="text-xl font-medium mb-2">Welcome to Finesse</h3>
          <p className="text-muted-foreground mb-4">
            Let's start with a quick introduction. Please enter your name below and then record a short introduction video.
          </p>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Your Full Name"
              value={customerName}
              onChange={updateName}
              className="w-full px-4 py-2 rounded-md border border-input bg-white/50 backdrop-blur-sm focus:border-finesse-400 focus:ring-2 focus:ring-finesse-400/20 transition-all"
            />
          </div>
        </div>
      );
    } else if (status === 'video_questions') {
      return (
        <div className="text-center max-w-md mx-auto mb-6 animate-fade-in">
          <h3 className="text-xl font-medium mb-2">Branch Manager Question</h3>
          <p className="text-finesse-700 italic mb-4">
            "{currentQuestionData.branchManagerScript}"
          </p>
          {currentQuestionData.responsePrompt && (
            <p className="text-sm text-muted-foreground">
              {currentQuestionData.responsePrompt}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mx-auto max-w-3xl glass-card p-6 animate-slide-up">
      {renderVideoInstructions()}

      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-black/20 mb-4">
        {countdown > 0 && countdown <= 3 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <span className="text-6xl text-white font-bold animate-pulse">{countdown}</span>
          </div>
        )}

        {!previewUrl ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={previewRef}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {recording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 text-white px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}
      </div>

      {recording && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Recording in progress...</span>
            <span>{elapsedTime}s / {maxDuration}s</span>
          </div>
          <Progress value={(elapsedTime / maxDuration) * 100} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        {!recording && !previewUrl && (
          <Button
            onClick={startCountdown}
            className="bg-finesse-600 hover:bg-finesse-700 text-white transition-all"
          >
            <Video className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        )}

        {recording && (
          <Button
            onClick={stopRecording}
            variant="destructive"
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        )}

        {previewUrl && (
          <>
            <Button
              onClick={handleReRecord}
              variant="outline"
              className="border-finesse-300 hover:bg-finesse-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Record Again
            </Button>

            <Button
              onClick={handleSubmitRecording}
              className="bg-finesse-600 hover:bg-finesse-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {status === 'video_intro' ? 'Continue' : 'Submit Answer'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default VideoManager;
