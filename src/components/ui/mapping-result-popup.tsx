import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, X } from "lucide-react";

interface MappingResult {
  success: boolean;
  message: string;
  mappedIds: string[];
  totalAmount: number;
}

interface MappingResultPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: MappingResult | null;
  onClose: () => void;
}

export function MappingResultPopup({ open, onOpenChange, result, onClose }: MappingResultPopupProps) {
  const [timeLeft, setTimeLeft] = useState(2);

  useEffect(() => {
    if (open && result) {
      setTimeLeft(2);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [open, result, onClose]);

  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center text-center space-y-4 p-6">
          {/* Icon */}
          <div className={`p-4 rounded-full ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            {result.success ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>

          {/* Status */}
          <div>
            <h3 className={`text-lg font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.success ? 'Mapping Successful!' : 'Mapping Failed'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{result.message}</p>
          </div>

                                           {/* Mapped ID */}
            {result.success && result.mappedIds.length > 0 && (
              <div className="w-full">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Mapping ID:</h4>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="text-xs font-mono text-gray-600 py-1">
                    {result.mappedIds[0]}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Total Amount: ₹{result.totalAmount.toLocaleString()}
                </div>
              </div>
            )}

          {/* Auto-close indicator */}
          <div className="text-xs text-gray-400">
            Auto-closing in {timeLeft} second{timeLeft !== 1 ? 's' : ''}...
          </div>

          {/* Close button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="mt-2"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}