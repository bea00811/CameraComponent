import React, { useState, useRef, useEffect } from 'react';
import './Camera.css';

const CameraApp: React.FC = () => {
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true); // true - фронтальная, false - задняя
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Функция открытия камеры
  const openCamera = async (useFrontCamera: boolean = true): Promise<void> => {
    try {
      setError('');
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Ваш браузер не поддерживает камеру');
      }

      // Закрываем предыдущий поток если есть
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: useFrontCamera ? 'user' : 'environment', // 'user' - фронтальная, 'environment' - задняя
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      setIsCameraOpen(true);
      setIsFrontCamera(useFrontCamera);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => {
            setError('Ошибка воспроизведения видео');
          });
        };
      }

    } catch (error) {
      setError(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  // Функция переключения камеры
  const switchCamera = async (): Promise<void> => {
    const newCameraMode = !isFrontCamera; // Переключаем на противоположную
    await openCamera(newCameraMode);
  };

  // Функция создания и сохранения фото
  const takeAndSavePhoto = (): void => {
    if (!videoRef.current) {
      setError('Камера не готова');
      return;
    }

    try {
      const video = videoRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Видео не загружено');
        return;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        setError('Не удалось создать контекст canvas');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Зеркальное отображение только для фронтальной камеры
      if (isFrontCamera) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Сохраняем фото
      const link = document.createElement('a');
      link.href = photoDataUrl;
      link.download = `photo-${new Date().getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setError('');
      
      // Закрываем камеру после сохранения
      closeCamera();
      
    } catch (error) {
      setError('Ошибка при создании фото');
    }
  };

  // Функция закрытия камеры
  const closeCamera = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setError('');
  };

  // Очистка
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-app">
      {!isCameraOpen && (
        <div className="camera-launch-screen">
          <button 
            className="open-selfie-btn" 
            onClick={() => openCamera(true)} // Открываем фронтальную камеру
          >
            📸 Сделать селфи
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      {isCameraOpen && (
        <div className="camera-interface">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
            style={{ transform: isFrontCamera ? 'scaleX(-1)' : 'none' }} // Зеркало только для селфи
          />
          
          {error && (
            <div className="error-overlay">
              <div className="error-text">{error}</div>
              <button onClick={closeCamera} className="error-close-btn">
                Закрыть
              </button>
            </div>
          )}

          {!error && (
            <div className="camera-controls">
              {/* Кнопка съемки */}
              <button className="capture-btn" onClick={takeAndSavePhoto}>
                <div className="capture-circle"></div>
              </button>
              
              {/* Кнопка переключения камеры */}
              <button 
                className="close-camera-btn"
                onClick={switchCamera}
              >
                {isFrontCamera ? '📷' : '📱'} {/* Иконка меняется */}
              </button>
              
              {/* Кнопка закрытия
              <button className="close-camera-btn" onClick={closeCamera}>
                ✕
              </button> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraApp;