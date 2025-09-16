import { useRef, useState } from "react";

export default function SelfieCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // фронталка
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsOpen(true);
      }
    } catch (err) {
      console.error("Ошибка доступа к камере:", err);
    }
  };

  return (
    <div>
      <button onClick={openCamera}>Включить селфи-камеру</button>
      {isOpen && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "300px", border: "1px solid black" }}
        />
      )}
    </div>
  );
}
