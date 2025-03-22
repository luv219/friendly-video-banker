
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useApplication } from '@/contexts/ApplicationContext';
import VideoManager from '@/components/VideoManager';
import DocumentUpload from '@/components/DocumentUpload';
import ApplicationStatus from '@/components/ApplicationStatus';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const { status, setStatus } = useApplication();

  const renderWelcomeScreen = () => (
    <div className="container max-w-4xl mx-auto px-6 py-12 text-center animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-tr from-finesse-600 to-finesse-400 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-1c0-1-.5-1.5-1-2V5z"></path>
        </svg>
      </div>

      <h1 className="text-4xl font-light mb-4 leading-tight">
        Welcome to <span className="font-bold">Finesse</span>
      </h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Your AI-powered branch manager is ready to guide you through your loan application process with a personalized video experience.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-xl text-left">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-finesse-500">
              <path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21A2 2 0 0 1 15.2 22Z"></path>
              <path d="M2 3h20"></path>
              <path d="M12 6v12"></path>
              <path d="M8 12h8"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Video Interview</h3>
          <p className="text-muted-foreground text-sm">
            Engage in a conversational interview with our virtual branch manager instead of filling out forms.
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-xl text-left">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-finesse-500">
              <path d="M21 8v13H3V8"></path>
              <path d="M1 3h22v5H1z"></path>
              <path d="M10 12h4"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Easy Document Upload</h3>
          <p className="text-muted-foreground text-sm">
            Quickly upload your Aadhaar, PAN, and income proof documents through a simple interface.
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-xl text-left">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-finesse-500">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Instant Decision</h3>
          <p className="text-muted-foreground text-sm">
            Receive prompt feedback on your loan application status with clear next steps.
          </p>
        </div>
      </div>
      
      <Button
        onClick={() => setStatus('video_intro')}
        className="bg-finesse-600 hover:bg-finesse-700 text-white text-lg px-8 py-6 rounded-full transition-all shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
      >
        Start Your Application
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (status) {
      case 'initial':
        return renderWelcomeScreen();
      case 'video_intro':
        return (
          <>
            <Navigation />
            <VideoManager />
          </>
        );
      case 'document_upload':
        return (
          <>
            <Navigation />
            <DocumentUpload />
          </>
        );
      case 'video_questions':
        return (
          <>
            <Navigation />
            <VideoManager />
          </>
        );
      case 'processing':
      case 'approved':
      case 'rejected':
      case 'more_info':
        return (
          <>
            <Navigation />
            <ApplicationStatus />
          </>
        );
      default:
        return renderWelcomeScreen();
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </MainLayout>
  );
};

export default Index;
