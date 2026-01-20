"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  slot: 1 | 2;
  onUpload: (key: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  expiresAt: string;
}

type UploadState = "idle" | "uploading" | "uploaded" | "error";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";

export function ImageUpload({ slot, onUpload, onRemove, disabled = false }: ImageUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "JPG, PNG, WEBP 형식만 업로드할 수 있어요";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "파일 크기는 10MB 이하여야 해요";
    }
    return null;
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      setState("uploading");
      setProgress(0);

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      try {
        setProgress(10);
        const presignedResponse = await fetch("/api/v1/uploads/presigned-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            fileSize: file.size,
          }),
        });

        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json().catch(() => ({}));
          throw new Error(errorData.message || "업로드 URL을 가져오는데 실패했어요");
        }

        const { uploadUrl, key }: PresignedUrlResponse = await presignedResponse.json();
        setProgress(30);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const uploadProgress = 30 + (event.loaded / event.total) * 60;
              setProgress(Math.round(uploadProgress));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error("파일 업로드에 실패했어요"));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("네트워크 오류가 발생했어요"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("업로드가 취소되었어요"));
          });

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        setProgress(100);
        setState("uploaded");
        onUpload(key);

        toast.success(`캡처 ${slot} 업로드 완료!`);
      } catch (err) {
        console.error("Upload error:", err);
        setState("error");
        setPreviewUrl(null);
        URL.revokeObjectURL(objectUrl);

        const message = err instanceof Error ? err.message : "업로드에 실패했어요";
        toast.error(message);
      }
    },
    [slot, onUpload, validateFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
      e.target.value = "";
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled || state === "uploading") return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [disabled, state, handleUpload]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && state !== "uploading") {
        setIsDragOver(true);
      }
    },
    [disabled, state]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled || state === "uploading") return;
    fileInputRef.current?.click();
  }, [disabled, state]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setState("idle");
      setProgress(0);
      setPreviewUrl(null);
      onRemove();
    },
    [previewUrl, onRemove]
  );

  const handleRetry = useCallback(() => {
    setState("idle");
    setProgress(0);
    setPreviewUrl(null);
    fileInputRef.current?.click();
  }, []);

  const renderIdleState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-2"
    >
      <motion.div
        animate={{ scale: isDragOver ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Camera className="h-8 w-8 text-slate-400" />
      </motion.div>
      <span className="text-sm text-slate-500">캡처를 올려주세요</span>
      <span className="text-xs text-slate-400">JPG, PNG, WEBP (최대 10MB)</span>
    </motion.div>
  );

  const renderUploadingState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm"
    >
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-50"
        />
      )}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <span className="text-sm font-medium text-slate-700 tabular-nums">{progress}%</span>
      </div>
    </motion.div>
  );

  const renderUploadedState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative h-full w-full"
    >
      <img
        src={previewUrl!}
        alt={`캡처 ${slot}`}
        className="h-full w-full rounded-xl object-cover"
      />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-md"
      >
        <Check className="h-4 w-4 text-white" strokeWidth={3} />
      </motion.div>

      <motion.button
        type="button"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 25,
          delay: 0.15,
        }}
        whileTap={{ scale: 0.9 }}
        onClick={handleRemove}
        className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 transition-colors hover:bg-black/70"
        aria-label="이미지 삭제"
      >
        <X className="h-4 w-4 text-white" strokeWidth={2} />
      </motion.button>

      <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5">
        <span className="text-xs font-medium text-white">캡처 {slot}</span>
      </div>
    </motion.div>
  );

  const renderErrorState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-2"
    >
      <AlertCircle className="text-destructive h-8 w-8" />
      <span className="text-sm text-slate-700">업로드 실패</span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={handleRetry}
        className="text-primary hover:bg-primary/10 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
      >
        다시 시도
      </motion.button>
    </motion.div>
  );

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileSelect}
        className="sr-only"
        disabled={disabled || state === "uploading"}
        aria-label={`캡처 ${slot} 업로드`}
      />

      <motion.div
        whileTap={state === "idle" && !disabled ? { scale: 0.98 } : undefined}
        onClick={state === "idle" || state === "error" ? handleClick : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative aspect-square overflow-hidden rounded-xl transition-all duration-200",
          state === "idle" && [
            "bg-slate-50",
            "border-2 border-dashed",
            isDragOver
              ? "border-primary bg-primary/5"
              : "hover:border-primary/50 border-slate-200 hover:bg-slate-100",
            "flex items-center justify-center",
            "cursor-pointer",
          ],
          state === "uploading" && "border-primary/30 border-2",
          state === "uploaded" && "border-0",
          state === "error" && [
            "bg-red-50",
            "border-2 border-dashed border-red-200",
            "flex items-center justify-center",
            "cursor-pointer",
          ],
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full items-center justify-center"
            >
              {renderIdleState()}
            </motion.div>
          )}

          {state === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              {renderUploadingState()}
            </motion.div>
          )}

          {state === "uploaded" && (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              {renderUploadedState()}
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full items-center justify-center"
            >
              {renderErrorState()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ImageUpload;
