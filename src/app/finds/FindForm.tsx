"use client";

import { useRef, useState } from "react";
import { resizeImage } from "@/lib/image-resize";
import { LocationPicker } from "@/components/LocationPicker";

type ExistingPhoto = { id: string; url: string };

export function FindForm({
  action,
  headingOptions,
  defaultValues,
  existingPhotos = [],
  labels,
}: {
  action: (formData: FormData) => void | Promise<void>;
  headingOptions: string[];
  defaultValues?: {
    title?: string;
    description?: string;
    heading?: string;
    tags?: string[];
    shopName?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  existingPhotos?: ExistingPhoto[];
  labels: {
    title: string;
    description: string;
    heading: string;
    tags: string;
    tagsHint: string;
    shopName: string;
    address: string;
    search: string;
    useMyLocation: string;
    locating: string;
    lat: string;
    lon: string;
    openInMaps: string;
    found: string;
    notFound: string;
    error: string;
    locationError: string;
    photos: string;
    existingPhotos: string;
    remove: string;
    processingPhotos: string;
    save: string;
  };
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  async function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) {
      setPreviews([]);
      return;
    }
    setIsProcessing(true);
    const resized = await Promise.all(files.map((file) => resizeImage(file)));
    setIsProcessing(false);

    const dataTransfer = new DataTransfer();
    resized.forEach((file) => dataTransfer.items.add(file));
    if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;

    setPreviews(resized.map((file) => URL.createObjectURL(file)));
  }

  function toggleRemove(id: string) {
    setRemovedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.title} *
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.description}
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {labels.heading} *
          <input
            name="heading"
            list="heading-options"
            required
            defaultValue={defaultValues?.heading}
            placeholder="e.g. Furniture"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <datalist id="heading-options">
            {headingOptions.map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {labels.tags}
          <input
            name="tags"
            defaultValue={defaultValues?.tags?.join(", ")}
            placeholder="wood, handmade"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
      </div>
      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">{labels.tagsHint}</p>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.shopName}
        <input
          name="shopName"
          defaultValue={defaultValues?.shopName}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </label>

      <LocationPicker
        defaultAddress={defaultValues?.address}
        defaultLatitude={defaultValues?.latitude}
        defaultLongitude={defaultValues?.longitude}
        labels={{
          address: labels.address,
          search: labels.search,
          useMyLocation: labels.useMyLocation,
          locating: labels.locating,
          lat: labels.lat,
          lon: labels.lon,
          openInMaps: labels.openInMaps,
          found: labels.found,
          notFound: labels.notFound,
          error: labels.error,
          locationError: labels.locationError,
        }}
      />

      {existingPhotos.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{labels.existingPhotos}</span>
          <div className="flex flex-wrap gap-3">
            {existingPhotos.map((photo) => (
              <label key={photo.id} className="relative flex flex-col items-center gap-1 text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  className={`h-20 w-20 rounded-lg object-cover ${removedIds.includes(photo.id) ? "opacity-30" : ""}`}
                />
                <span className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="removePhotoIds"
                    value={photo.id}
                    checked={removedIds.includes(photo.id)}
                    onChange={() => toggleRemove(photo.id)}
                  />
                  {labels.remove}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.photos}
        <input
          ref={fileInputRef}
          name="photos"
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handlePhotosChange}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </label>
      {isProcessing && <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">{labels.processingPhotos}</p>}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="h-20 w-20 rounded-lg object-cover" />
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing}
        className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {labels.save}
      </button>
    </form>
  );
}
