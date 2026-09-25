import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, User } from 'lucide-react';
import Button from '../../common/Button';

const KycSelfieCapture = forwardRef(function KycSelfieCapture(
  {
    onCapture,
    onRetake,
    disabled = false,
    error,
    instructionText = 'Position your face inside the frame and look directly at the camera',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [permissionState, setPermissionState] = useState('prompt');
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [internalError, setInternalError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      setInternalError(null);
      setPermissionState('requesting');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        setPermissionState('granted');
      }
    } catch (err) {
      const message =
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please enable camera permissions and try again.'
          : err.name === 'NotFoundError'
          ? 'No camera detected on this device.'
          : 'Unable to access camera. Please check your device.';
      setInternalError(message);
      setPermissionState('denied');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedImage({ blob, url });
          stopCamera();
          if (onCapture) {
            onCapture({ blob, url });
          }
        }
      },
      'image/jpeg',
      0.92
    );
  }, [onCapture, stopCamera]);

  const handleRetake = useCallback(() => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
    if (onRetake) {
      onRetake();
    }
    startCamera();
  }, [capturedImage, onRetake, startCamera]);

  const displayError = error || internalError;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')} data-testid={testId} {...rest}>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        {displayError ? (
          <div className="mb-3 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
            <p className="text-xs text-rose-800">{displayError}</p>
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-lg bg-slate-900">
          <div className="mx-auto aspect-square w-full max-w-sm">
            {capturedImage ? (
              <img
                src={capturedImage.url}
                alt="Captured selfie"
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {!cameraReady ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-center text-white/80">
                      <User size={48} aria-hidden="true" />
                      <p className="px-4 text-sm">{instructionText}</p>
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {cameraReady ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-4/5 w-4/5 rounded-full border-2 border-white/60" />
              </div>
            ) : null}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          {!capturedImage && permissionState !== 'granted' ? (
            <Button onClick={startCamera} variant="primary" leadingIcon={Camera}>
              Enable Camera
            </Button>
          ) : null}

          {!capturedImage && cameraReady ? (
            <Button onClick={handleCapture} variant="primary" leadingIcon={Camera}>
              Capture Selfie
            </Button>
          ) : null}

          {capturedImage ? (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 size={16} aria-hidden="true" />
                Selfie captured
              </div>
              <Button
                onClick={handleRetake}
                variant="outline"
                leadingIcon={RefreshCw}
                disabled={disabled}
              >
                Retake
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
});

KycSelfieCapture.propTypes = {
  onCapture: PropTypes.func,
  onRetake: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  instructionText: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default KycSelfieCapture;