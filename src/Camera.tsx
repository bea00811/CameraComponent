import React, { useState, useRef, useEffect } from 'react';
import './Camera.css';

const CameraApp: React.FC = () => {
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Функция открытия камеры с обработкой ошибок
  const openSelfieCamera = async (): Promise<void> => {
    try {
      setError('');
      console.log('Opening camera...');
      
      // Проверяем поддержку getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Ваш браузер не поддерживает камеру');
      }

      // Пробуем разные constraints для камеры
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user', // Фронтальная камера
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Camera access granted');
      streamRef.current = stream;
      setIsCameraOpen(true);
      
      // Ждем пока video элемент будет готов
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Setting video source');
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current?.play().catch(e => {
              console.error('Play error:', e);
              setError('Ошибка воспроизведения видео');
            });
          };
        }
      }, 100);

    } catch (error) {
      console.error('Camera error:', error);
      setError(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  // Функция создания фото
  const takePhoto = (): void => {
    if (!videoRef.current || !streamRef.current) {
      setError('Камера не готова');
      return;
    }

    try {
      const video = videoRef.current;
      
      // Проверяем, что видео действительно воспроизводится
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
      
      // Зеркальное отображение для селфи
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(photoDataUrl);
      setError('');
      
    } catch (error) {
      console.error('Photo error:', error);
      setError('Ошибка при создании фото');
    }
  };

  // Функция сохранения фото
  const savePhoto = (): void => {
    if (!capturedPhoto) return;
    
    try {
      const link = document.createElement('a');
      link.href = capturedPhoto;
      link.download = `selfie-${new Date().getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Save error:', error);
      setError('Ошибка при сохранении фото');
    }
  };

  // Функция закрытия камеры
  const closeCamera = (): void => {
    if (streamRef.current) {
      console.log('Closing camera stream');
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCapturedPhoto(null);
    setError('');
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Debug: логируем состояние видео
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onerror = (e) => {
        console.error('Video error:', e);
        setError('Ошибка видео');
      };
    }
  }, [isCameraOpen]);

  return (
    <div className="camera-app">
      {/* Кнопка открытия камеры */}
      {!isCameraOpen && (
        <div className="camera-launch-screen">
          <button 
            className="open-selfie-btn"
            onClick={openSelfieCamera}
          >
            📸 Сделать селфи
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      {/* Интерфейс камеры */}
      {isCameraOpen && (
        <div className="camera-interface">
          {/* Видео с камеры */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Сообщение об ошибке */}
          {error && (
            <div className="error-overlay">
              <div className="error-text">{error}</div>
              <button onClick={closeCamera} className="error-close-btn">
                Закрыть
              </button>
            </div>
          )}

          {/* Кнопка съемки */}
          {!capturedPhoto && !error && (
            <div className="camera-controls">
              <button 
                className="capture-btn"
                onClick={takePhoto}
              >
                <div className="capture-circle"></div>
              </button>
              
              <button 
                className="close-camera-btn"
                onClick={closeCamera}
              >
                ✕
              </button>
            </div>
          )}

          {/* Предпросмотр фото */}
          {capturedPhoto && (
            <div className="photo-preview-overlay">
              <img 
                src={capturedPhoto} 
                alt="Ваше селфи" 
                className="preview-image"
              />
              
              <div className="photo-actions">
                <button className="save-btn" onClick={savePhoto}>
                  ✅ Сохранить
                </button>
                <button className="retake-btn" onClick={() => setCapturedPhoto(null)}>
                  🔄 Переснять
                </button>
                <button className="close-btn" onClick={closeCamera}>
                  ❌ Закрыть
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraApp;