import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import LoadingOverlay from './LoadingOverlay';

interface EquipmentScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (exercises: any[]) => void;
}

export default function EquipmentScanModal({ isOpen, onClose, onAnalysisComplete }: EquipmentScanModalProps) {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files).slice(0, 5)); // Max 5 files
    }
  };

  const analyzeEquipment = async () => {
    if (!user || selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/ai/analyze-equipment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze equipment');
      }

      const result = await response.json();
      onAnalysisComplete(result.exercises || []);
      onClose();
    } catch (error) {
      console.error('Equipment analysis failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <i className="fas fa-camera text-upper-a"></i>
              <span>Scan Gym Equipment</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-upper-a/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-camera text-upper-a text-3xl"></i>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Take photos of your gym equipment</h4>
              <p className="text-sm text-gray-600">Our AI will analyze your equipment and suggest exercises you can perform.</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <input
                type="file"
                id="equipmentPhotos"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="equipmentPhotos" className="cursor-pointer">
                <i className="fas fa-upload text-gray-400 text-2xl mb-2 block"></i>
                <p className="text-gray-600">Click to upload photos or drag and drop</p>
                <p className="text-sm text-gray-400">Supports multiple images (JPG, PNG)</p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Selected files: {selectedFiles.length}/5</p>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="text-xs text-gray-500 truncate">
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isAnalyzing}
              >
                Cancel
              </Button>
              <Button
                onClick={analyzeEquipment}
                disabled={selectedFiles.length === 0 || isAnalyzing}
                className="flex-1 bg-upper-a hover:bg-blue-600"
              >
                <i className="fas fa-brain mr-2"></i>
                Analyze Equipment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <LoadingOverlay 
        isVisible={isAnalyzing} 
        message="Analyzing your gym equipment..." 
      />
    </>
  );
}
