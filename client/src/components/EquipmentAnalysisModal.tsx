import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EquipmentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExercisesFound: (exercises: any[]) => void;
}

export default function EquipmentAnalysisModal({ 
  isOpen, 
  onClose, 
  onExercisesFound 
}: EquipmentAnalysisModalProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 5); // Limit to 5 images
    const newPreviews: string[] = [];
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newFiles.length) {
          setImages(prev => [...prev, ...newFiles].slice(0, 5));
          setPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeEquipment = async () => {
    if (images.length === 0) {
      toast({
        title: 'No Images',
        description: 'Please upload at least one image of your gym equipment.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert images to base64
      const base64Images = await Promise.all(
        images.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const response = await apiRequest('POST', '/api/ai/equipment-analysis', {
        images: base64Images
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.exercises) {
          setResults(data.exercises);
          setAnalysisComplete(true);
          toast({
            title: 'Analysis Complete!',
            description: `Found ${data.exercises.length} exercises based on your equipment.`,
          });
        } else {
          throw new Error(data.message || 'Analysis failed');
        }
      } else {
        throw new Error('Failed to analyze equipment');
      }
    } catch (error) {
      console.error('Equipment analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze your equipment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addExercisesToLibrary = () => {
    onExercisesFound(results);
    toast({
      title: 'Exercises Added!',
      description: `${results.length} new exercises have been added to your library.`,
    });
    handleClose();
  };

  const handleClose = () => {
    setImages([]);
    setPreviews([]);
    setResults([]);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            AI Equipment Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!analysisComplete && (
            <>
              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Upload photos of your gym equipment for AI analysis
                  </p>
                  <Badge variant="secondary">{images.length}/5 images</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload Area */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB each</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />

                  {/* Image Previews */}
                  <div className="grid grid-cols-2 gap-2">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Equipment ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={analyzeEquipment}
                    disabled={isAnalyzing || images.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Equipment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Results Section */}
          {analysisComplete && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Analysis Complete! Found {results.length} exercises
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((exercise, index) => (
                  <Card key={index} className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {exercise.mainMuscle}
                        </Badge>
                      </div>
                      
                      <div 
                        className="text-sm text-gray-600 mb-2"
                        dangerouslySetInnerHTML={{ __html: exercise.description }}
                      />
                      
                      <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                        <strong>Pro Tip:</strong> {exercise.tip}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Skip
                </Button>
                <Button
                  onClick={addExercisesToLibrary}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add to Exercise Library
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}