import React, { useState, useRef, useEffect } from 'react';

interface CameraComponentProps {
  onPhotoTaken?: (photoData: string) => void;
  className?: string;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ 
  onPhotoTaken, 
  className 
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Устанавливаем stream в video когда оба доступны
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraOpen]);

  const openCamera = async (): Promise<void> => {
    try {
      setError('');
      setIsLoading(true);
      
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } as MediaTrackConstraints
      });
      
      setStream(newStream);
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Ошибка открытия камеры:', error);
      setError('Не удалось открыть камеру. Проверьте разрешения.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeCamera = (): void => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setCapturedPhoto(null);
  };

  const takePhoto = (): void => {
    if (!videoRef.current || !stream || !videoRef.current.videoWidth) {
      setError('Камера не готова');
      return;
    }

    try {
      const video = videoRef.current;
      
      // Создаем canvas для фото
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Не удалось получить контекст canvas');
      }

      // Устанавливаем размеры canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Зеркальное отображение для селфи
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      
      // Рисуем кадр видео на canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Получаем фото в формате Data URL
      const photoDataUrl = canvas.toDataURL('image/png');
      setCapturedPhoto(photoDataUrl);
      
      // Вызываем колбэк если передан
      if (onPhotoTaken) {
        onPhotoTaken(photoDataUrl);
      }
      
    } catch (error) {
      console.error('Ошибка при создании фото:', error);
      setError('Ошибка при создании фото');
    }
  };

  const downloadPhoto = (): void => {
    if (!capturedPhoto) return;
    
    const link = document.createElement('a');
    link.href = capturedPhoto;
    link.download = `selfie-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const retakePhoto = (): void => {
    setCapturedPhoto(null);
  };

  // Проверка поддержки камеры
  const isCameraSupported = (): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (!isCameraSupported()) {
    return (
      <div className={className} style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Ваш браузер не поддерживает доступ к камере</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ padding: '20px', textAlign: 'center' }}>
      {/* Видео с камеры */}
      {isCameraOpen && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            maxWidth: '400px',
            border: '2px solid #007bff',
            borderRadius: '8px',
            display: capturedPhoto ? 'none' : 'block',
            transform: 'scaleX(-1)' // Видимое зеркальное отображение
          }}
        />
      )}
      
      {/* Предпросмотр сделанного фото */}
      {capturedPhoto && (
        <div>
          <img
            src={capturedPhoto}
            alt="Селфи"
            style={{
              width: '100%',
              maxWidth: '400px',
              border: '2px solid #28a745',
              borderRadius: '8px'
            }}
          />
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={downloadPhoto}
              style={buttonStyle('#28a745')}
            >
              💾 Сохранить
            </button>
            <button
              onClick={retakePhoto}
              style={buttonStyle('#ffc107')}
            >
              🔄 Переснять
            </button>
            <button
              onClick={closeCamera}
              style={buttonStyle('#dc3545')}
            >
              ❌ Закрыть
            </button>
          </div>
        </div>
      )}
      
      {/* Кнопки управления */}
      {!isCameraOpen ? (
        <button
          onClick={openCamera}
          disabled={isLoading}
          style={{
            ...buttonStyle(isLoading ? '#ccc' : '#007bff'),
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Загрузка...' : '📷 Открыть камеру'}
        </button>
      ) : (
        !capturedPhoto && (
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={takePhoto}
              style={buttonStyle('#28a745')}
            >
              📸 Сделать фото
            </button>
            <button
              onClick={closeCamera}
              style={buttonStyle('#dc3545')}
            >
              ❌ Закрыть камеру
            </button>
          </div>
        )
      )}
      
      {error && (
        <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
      )}
      
      {/* Скрытый canvas для ссылок */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

// Вспомогательная функция для стилей кнопок
const buttonStyle = (backgroundColor: string): React.CSSProperties => ({
  padding: '10px 20px',
  margin: '5px',
  backgroundColor,
  color: backgroundColor === '#ffc107' ? 'black' : 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
});

export default CameraComponent;