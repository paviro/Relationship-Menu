import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Step, TransitionPhase } from './types';
import { getSpotlightRect } from './utils';

const noopSubscribe = () => () => {};

export function useOnboardingState(
  steps: Step[],
  storageKey: string,
  onFinish?: () => void
) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [closed, setClosed] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('none');

  // Auto-open on first visit (when the storage key is absent). Read as an
  // external store so the server render (always "seen") stays hydration-safe.
  const seenOnboarding = useSyncExternalStore(
    noopSubscribe,
    () => localStorage.getItem(storageKey) !== null,
    () => true
  );
  const isOpen = !seenOnboarding && !closed;

  // Reset sub-step counter when moving to a new step
  const [prevStep, setPrevStep] = useState(currentStep);
  if (prevStep !== currentStep) {
    setPrevStep(currentStep);
    setCurrentSubStep(0);
  }

  const step = currentStep >= 0 ? steps[currentStep] : null;
  const isWelcomeScreen = currentStep === -1;
  const hasSubSteps = step?.subSteps && step.subSteps.length > 0;

  useEffect(() => {
    if (!isOpen || !step) return;
    
    const updateSpotlightRect = () => {
      setSpotlightRect(getSpotlightRect(step));
    };
    
    setTimeout(updateSpotlightRect, 100);
    
    window.addEventListener('resize', updateSpotlightRect);
    
    return () => {
      window.removeEventListener('resize', updateSpotlightRect);
    };
  }, [isOpen, step]);

  const handleClose = useCallback(() => {
    setClosed(true);
    localStorage.setItem(storageKey, 'true');
    if (onFinish) onFinish();
  }, [onFinish, storageKey]);

  useEffect(() => {
    if (!isOpen) return;
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.body.style.overflow = isOpen ? 'hidden' : '';
    window.addEventListener('keydown', onKey);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, handleClose]);

  const handleNext = () => {
    if (isWelcomeScreen) {
      setTransitionPhase('fadeOutWelcome');
      
      setTimeout(() => {
        setCurrentStep(0);
        setTransitionPhase('showFullPage');
        
        const newRect = step ? getSpotlightRect(steps[0]) : null;
        if (newRect) setSpotlightRect(newRect);
        
        setTimeout(() => {
          setTransitionPhase('fadeInSpotlight');
          
          setTimeout(() => {
            setTransitionPhase('none');
          }, 700);
        }, 200);
      }, 300);
    } else if (hasSubSteps && step?.subSteps && currentSubStep < step.subSteps.length - 1) {
      // Move to next sub-step
      setCurrentSubStep(s => s + 1);
    } else if (currentStep < steps.length - 1) {
      // Move to next main step
      setCurrentStep((s) => s + 1);
      setCurrentSubStep(0);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (hasSubSteps && currentSubStep > 0) {
      // Move to previous sub-step
      setCurrentSubStep(s => s - 1);
    } else if (currentStep > 0) {
      // Move to previous main step
      setCurrentStep((s) => s - 1);
      
      // If the previous step has sub-steps, move to the last sub-step
      const prevStep = steps[currentStep - 1];
      if (prevStep.subSteps && prevStep.subSteps.length > 0) {
        setCurrentSubStep(prevStep.subSteps.length - 1);
      } else {
        setCurrentSubStep(0);
      }
    }
  };

  return {
    currentStep,
    currentSubStep,
    isOpen,
    spotlightRect,
    transitionPhase,
    step,
    isWelcomeScreen,
    hasSubSteps,
    handleNext,
    handlePrevious,
    handleClose
  };
}

export function useModalSize(
  modalRef: React.RefObject<HTMLDivElement | null>,
  transitionPhase: TransitionPhase,
  currentStep: number,
  currentSubStep: number
) {
  const [modalSize, setModalSize] = useState({ width: 340, height: 300 });

  useEffect(() => {
    if (!modalRef.current || transitionPhase !== 'none') return;
    
    const updateModalSize = () => {
      if (modalRef.current) {
        const rect = modalRef.current.getBoundingClientRect();
        setModalSize({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    updateModalSize();
    
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateModalSize);
      observer.observe(modalRef.current);
      return () => observer.disconnect();
    }
    
    window.addEventListener('resize', updateModalSize);
    return () => window.removeEventListener('resize', updateModalSize);
  }, [currentStep, transitionPhase, currentSubStep, modalRef]);

  return modalSize;
} 