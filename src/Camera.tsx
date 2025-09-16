import React, { useState, useRef, useEffect } from 'react';
import './Camera.css';

const CameraApp: React.FC = () => {
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Функция мгновенного открытия селфи-камеры
  const openSelfieCamera = async (): Promise<void> => {
    try {
      // Сразу открываем камеру без дополнительных кнопок
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: 'user', // Фронтальная камера
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } as MediaTrackConstraints
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Автоматически переходим в полноэкранный режим на мобильных
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
        } catch (fullscreenError) {
          console.log('Fullscreen not supported');
        }
      }

    } catch (error) {
      console.error('Error opening camera:', error);
      alert('Не удалось открыть камеру. Разрешите доступ к камере в настройках браузера.');
    }
  };

  // Функция создания фото
  const takePhoto = (): void => {
    if (!videoRef.current || !streamRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Зеркальное отображение для селфи
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoDataUrl);
  };

  // Функция сохранения фото
  const savePhoto = (): void => {
    if (!capturedPhoto) return;
    
    const link = document.createElement('a');
    link.href = capturedPhoto;
    link.download = `selfie-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // После сохранения закрываем камеру
    closeCamera();
  };

  // Функция переснять фото
  const retakePhoto = (): void => {
    setCapturedPhoto(null);
  };

  // Функция закрытия камеры
  const closeCamera = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Выходим из полноэкранного режима
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    setIsCameraOpen(false);
    setCapturedPhoto(null);
  };

  // Автоматически открываем камеру при монтировании компонента
  useEffect(() => {
    // Можно раскомментировать для автоматического открытия:
    // openSelfieCamera();
    
    // Очистка при размонтировании
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-app">
      {/* Если камера не открыта - показываем кнопку */}
      {!isCameraOpen && (
        <div className="camera-launch-screen">
          <button 
            className="open-selfie-btn"
            onClick={openSelfieCamera}
          >
            📸 Сделать селфи
          </button>
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
          />
          
          {/* Кнопка съемки (только если фото еще не сделано) */}
          {!capturedPhoto && (
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

          {/* Предпросмотр и кнопки после съемки */}
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
                <button className="retake-btn" onClick={retakePhoto}>
                  🔄 Переснять
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