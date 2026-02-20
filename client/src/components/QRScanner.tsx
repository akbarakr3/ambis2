import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Scan, X, Camera } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface QRScannerProps {
  onScan: (result: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QRScanner({ onScan, isOpen, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || !isScanning) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err: any) {
        console.error("Camera error:", err);
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please check permissions.",
          variant: "destructive",
        });
        setIsScanning(false);
      }
    };

    startCamera();

    return () => {
      const stream = (videoRef.current?.srcObject as MediaStream) || null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, isScanning, toast]);

  useEffect(() => {
    if (!isScanning || !canvasRef.current || !videoRef.current) return;

    const scanInterval = setInterval(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          // Simple QR code detection - check for data URLs or order IDs
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // For demo purposes, we'll look for patterns in the image
            // In production, use a library like jsQR
            
            // Attempt to decode using jsQR if available
            if (window.jsQR) {
              const code = (window.jsQR as any)(
                imageData.data,
                imageData.width,
                imageData.height
              );
              if (code && code.data) {
                onScan(code.data);
                setIsScanning(false);
                toast({
                  title: "QR Code Scanned",
                  description: `Order ID: ${code.data}`,
                });
              }
            }
          } catch (err) {
            console.error("QR scan error:", err);
          }
        }
      }
    }, 500);

    return () => clearInterval(scanInterval);
  }, [isScanning, onScan, toast]);

  const handleManualEntry = () => {
    const orderId = prompt("Enter Order ID or scan result:");
    if (orderId) {
      onScan(orderId);
      setIsScanning(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan Order QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isScanning && (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-green-500 m-4 rounded-lg pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-green-400 text-sm font-medium">
                Position QR code in frame
              </div>
            </div>
          )}

          {!isScanning && (
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => setIsScanning(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
              <Button onClick={handleManualEntry} variant="outline" className="w-full">
                Manual Entry
              </Button>
            </div>
          )}

          {isScanning && (
            <Button
              onClick={() => setIsScanning(false)}
              variant="destructive"
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Extend Window interface for jsQR
declare global {
  interface Window {
    jsQR?: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null;
  }
}
