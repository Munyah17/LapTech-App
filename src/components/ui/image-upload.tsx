"use client";

import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

function downscale(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(new File([blob], "upload.webp", { type: "image/webp" }))
            : reject(new Error("Could not encode image")),
        "image/webp",
        0.85
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });
}

export function ImageUpload({
  value,
  onChange,
  label = "Image URL",
  hint,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const original = event.target.files?.[0];
    if (!original) return;

    setUploading(true);
    setError("");
    try {
      let file = original;
      try {
        file = await downscale(original);
      } catch {
        file = original;
      }

      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <label className="block text-[12.5px] font-medium mb-1.5">{label}</label>
      {value && (
        <img
          src={value}
          alt="Current upload preview"
          className="mb-2 h-24 w-full rounded-lg border object-cover"
        />
      )}
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={upload}
        disabled={uploading}
        className="file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://… or upload an image"
        className="mt-2"
      />
      {uploading && (
        <p className="text-[12px] text-muted-foreground mt-1">Uploading…</p>
      )}
      {error ? (
        <p className="text-[12px] text-destructive mt-1">{error}</p>
      ) : (
        hint && <p className="text-[12px] text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}
