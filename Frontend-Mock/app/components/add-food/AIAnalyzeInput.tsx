'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  MealType,
  FatSecretSearchResultItem,
  AIAnalysisResult,
} from '@/app/lib/types';
import { analyzeFoodWithAI } from '@/app/lib/api/foods';
import {
  Sparkles,
  Camera,
  UploadCloud,
  X,
  Loader2,
  Brain,
  CheckCircle2,
  Database,
} from 'lucide-react';
import MealTypeSelector from './MealTypeSelector';
import FoodSearchResultCard from './FoodSearchResultCard';
import FoodDetailExpanded from './FoodDetailExpanded';

interface AIAnalyzeInputProps {
  selectedMeal: MealType;
  onMealChange: (meal: MealType) => void;
  onLogFatSecretFood: (payload: {
    fatsecretFoodId: string;
    fatsecretServingId: string;
    foodName: string;
    quantity: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingUnit: string;
  }) => Promise<void>;
}

/**
 * Resizes and compresses an image in browser memory before sending (Zero-Storage)
 * Encodes directly into Base64 format (< 250KB) for lightning-fast analysis
 */
function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ base64: img.src, mimeType: file.type || 'image/jpeg' });
        }
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const compressedBase64 = canvas.toDataURL(mimeType, 0.82);
        resolve({ base64: compressedBase64, mimeType });
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

export default function AIAnalyzeInput({
  selectedMeal,
  onMealChange,
  onLogFatSecretFood,
}: AIAnalyzeInputProps) {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [imageName, setImageName] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [selectedFood, setSelectedFood] = useState<FatSecretSearchResultItem | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load auth token
  React.useEffect(() => {
    getToken().then(setToken).catch(() => { });
  }, [getToken]);

  // Handle file select & client-side compression
  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAnalysisError('Please choose a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    setAnalysisError(null);
    setCompressing(true);
    try {
      const { base64, mimeType } = await compressImage(file);
      setSelectedImage(base64);
      setImageMime(mimeType);
      setImageName(file.name);
    } catch (err: any) {
      setAnalysisError('Could not process photo. Please try another image.');
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Trigger AI Recognition
  const handleAnalyze = async () => {
    if (!prompt.trim() && !selectedImage) {
      setAnalysisError('Please take a photo or enter a meal description to analyze.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    setSelectedFood(null);

    try {
      const authToken = await getToken();
      const res = await analyzeFoodWithAI(
        {
          prompt: prompt.trim() || undefined,
          imageBase64: selectedImage || undefined,
          mimeType: imageMime,
        },
        authToken
      );

      setResult(res);

      if (!res.foodName && res.foods.length === 0) {
        setAnalysisError(res.thinking || 'No food could be recognized. Please try again.');
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // If a user has clicked a food item, show the serving selector drawer
  if (selectedFood) {
    return (
      <FoodDetailExpanded
        foodItem={selectedFood}
        selectedMeal={selectedMeal}
        onMealChange={onMealChange}
        onBack={() => setSelectedFood(null)}
        onLogFood={async (payload) => {
          await onLogFatSecretFood(payload);
          setSelectedFood(null);
        }}
        token={token}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file inputs for Camera & Upload */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />

      {/* Input Card */}
      <div className="p-5 sm:p-6 bg-bg-card border border-border rounded-3xl shadow-sm space-y-5">
        {/* Meal Type Selector */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
            Target Meal
          </label>
          <MealTypeSelector
            selectedMeal={selectedMeal}
            onChange={onMealChange}
          />

        </div>

        {/* Image Capture Actions */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
            Photo Input
          </label>

          {/* Photo Preview Card */}
          {selectedImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-border bg-bg-input group max-w-sm mx-auto">
              <img
                src={selectedImage}
                alt="Selected meal preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                <p className="text-xs font-semibold truncate">
                  {imageName || 'Photo attached'}
                </p>
                <span className="text-[10px] text-white/80">
                  Compressed in RAM • Ready to analyze
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Take Photo Button */}
              <button
                type="button"
                disabled={compressing || analyzing}
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-border hover:border-mint hover:bg-mint-light/20 transition-all text-text-secondary hover:text-mint-dark group cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-mint-light/50 flex items-center justify-center text-mint-dark group-hover:scale-110 transition-transform mb-2">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-primary">Take Photo</span>
                <span className="text-[10px] text-text-tertiary">Mobile camera</span>
              </button>

              {/* Upload Image Button */}
              <button
                type="button"
                disabled={compressing || analyzing}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-border hover:border-peach hover:bg-peach-light/20 transition-all text-text-secondary hover:text-amber-600 group cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-peach-light/50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-primary">Upload Photo</span>
                <span className="text-[10px] text-text-tertiary">Gallery / Files</span>
              </button>
            </div>
          )}

          {compressing && (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-text-secondary mt-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-mint" />
              <span>Optimizing photo in RAM...</span>
            </div>
          )}
        </div>

        {/* Text Prompt / Notes */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
            Optional Notes or Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Grilled salmon with steamed broccoli and brown rice, 1 tablespoon olive oil"
            rows={2}
            className="w-full px-4 py-3 rounded-2xl bg-bg-input border border-border focus:border-mint focus:outline-hidden text-sm text-text-primary placeholder:text-text-tertiary transition-colors resize-none"
          />
        </div>

        {/* Error message */}
        {analysisError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold">
            {analysisError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing || compressing || (!prompt.trim() && !selectedImage)}
          className="w-full py-3.5 rounded-2xl bg-mint hover:bg-mint-dark text-text-on-dark font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Recognizing Food & Querying Database...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Food with AI</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* AI Recognition & Thinking Banner */}
          {result.foodName && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-mint-light/40 via-bg-card to-peach-light/20 border border-mint/30 shadow-xs space-y-3">
              {/* Header: Food Name + Confidence Score */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-mint-light text-mint-dark font-bold text-xs flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    <span>AI Identified</span>
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-text-primary">
                    {result.foodName}
                  </h3>
                </div>

                {/* Confidence Badge */}
                {result.confidenceScore > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-mint/15 border border-mint/30 text-mint-dark font-extrabold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mint" />
                    <span>{Math.round(result.confidenceScore * 100)}% Confidence</span>
                  </div>
                )}
              </div>

              {/* AI Thinking Box */}
              {result.thinking && (
                <div className="p-3.5 rounded-2xl bg-bg-card/80 border border-border/80 text-xs text-text-secondary space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-primary">
                    <span>💡 Visual Reasoning</span>
                  </div>
                  <p className="leading-relaxed">{result.thinking}</p>
                </div>
              )}
            </div>
          )}

          {/* Database Matches Section */}
          {result.foods && result.foods.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-mint-dark" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
                    Verified Database Matches ({result.foods.length})
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-text-tertiary">
                  Tap to choose serving
                </span>
              </div>

              <div className="grid gap-2.5">
                {result.foods.map((food) => (
                  <FoodSearchResultCard
                    key={food.food_id}
                    item={food}
                    onSelect={(item) => setSelectedFood(item)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-bg-card border border-border text-center space-y-2">
              <span className="text-2xl block">🔍</span>
              <h4 className="font-bold text-sm text-text-primary">No Database Matches Found</h4>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                {result.thinking || 'AI was unable to find matching foods in the database. Try taking another picture with clearer lighting.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
