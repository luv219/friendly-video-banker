
export const startVideoRecording = async (): Promise<{
  stream: MediaStream;
  recorder: MediaRecorder;
  chunks: BlobPart[];
}> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    // Check for supported MIME types
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    
    let selectedMimeType = '';
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        break;
      }
    }
    
    if (!selectedMimeType) {
      throw new Error('No supported MIME type found for MediaRecorder');
    }

    const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
    const chunks: BlobPart[] = [];

    recorder.addEventListener('dataavailable', (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    });

    return { stream, recorder, chunks };
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw new Error('Could not access camera. Please check permissions and try again.');
  }
};

export const stopVideoRecording = ({
  stream,
  recorder,
  chunks,
}: {
  stream: MediaStream;
  recorder: MediaRecorder;
  chunks: BlobPart[];
}): Promise<Blob> => {
  return new Promise((resolve) => {
    recorder.addEventListener('stop', () => {
      // Determine the blob type based on the recorder's mimeType or default to webm
      const mimeType = recorder.mimeType || 'video/webm';
      const videoBlob = new Blob(chunks, { type: mimeType });
      stream.getTracks().forEach((track) => track.stop());
      resolve(videoBlob);
    });

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  });
};

export const createVideoPreview = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

// Define a FaceDetector interface for TypeScript
interface FaceDetectorInterface {
  detect: (element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) => Promise<{ boundingBox: DOMRect }[]>;
}

// Basic face detection using the browser API
export const detectFace = async (videoElement: HTMLVideoElement): Promise<boolean> => {
  // Check if FaceDetector is available in the browser
  const hasFaceDetectorAPI = 'FaceDetector' in window;
  
  if (!hasFaceDetectorAPI) {
    console.warn('FaceDetector is not available in this browser');
    return true; // Assuming face is present if detection is not available
  }

  try {
    // Type assertion for FaceDetector
    const FaceDetector = (window as any).FaceDetector;
    const faceDetector = new FaceDetector() as FaceDetectorInterface;
    const faces = await faceDetector.detect(videoElement);
    return faces.length > 0;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return true; // Assuming face is present if there's an error
  }
};

// Standard set of questions for the loan application
export const loanApplicationQuestions = [
  {
    id: 'introduction',
    branchManagerScript: "Hello, I'm your virtual branch manager at Finesse Bank. I'll be guiding you through the loan application process. Let's start with a brief introduction - please tell me your name and why you're applying for a loan today.",
    responsePrompt: "Record your introduction",
    maxDuration: 60 // seconds
  },
  {
    id: 'loan_amount',
    branchManagerScript: "Thank you. How much would you like to borrow, and what will be the purpose of this loan?",
    responsePrompt: "Record your loan amount and purpose",
    maxDuration: 45
  },
  {
    id: 'employment',
    branchManagerScript: "Could you tell me about your current employment? Include your job title, employer name, and how long you've been working there.",
    responsePrompt: "Record your employment details",
    maxDuration: 60
  },
  {
    id: 'income',
    branchManagerScript: "What is your monthly income, and do you have any additional sources of income?",
    responsePrompt: "Record your income details",
    maxDuration: 45
  },
  {
    id: 'existing_debts',
    branchManagerScript: "Do you have any existing loans or credit card debts? If yes, please provide details including the outstanding amounts and monthly payments.",
    responsePrompt: "Record your existing debt information",
    maxDuration: 60
  },
  {
    id: 'confirmation',
    branchManagerScript: "Thank you for providing all the information. I'll now process your application based on the details and documents you've shared. You'll receive the decision shortly.",
    responsePrompt: null, // No response needed for this one
    maxDuration: 0
  }
];
