"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ImagePicker from "@/components/meals/image-picker";
import { fileToDataUrl, saveStoredMeal } from "@/lib/demo-store";
import classes from "@/app/meals/share/page.module.css";

// The real app passes a Server Action straight to <form action={shareMeal}>.
// Server Actions need a running server, so in the static demo the same fields
// are submitted here instead and persisted to localStorage. The markup below
// is identical to the real form.
export default function ShareMealForm() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const picked = formData.get("image");

    if (!picked || typeof picked === "string" || picked.size === 0) {
      setError("Please pick an image for your meal.");
      return;
    }

    setIsSaving(true);
    try {
      // Shrink before storing: the original bytes would blow the ~5 MB
      // localStorage budget after base64 encoding.
      const image = await fileToDataUrl(picked);

      saveStoredMeal({
        title: formData.get("title"),
        summary: formData.get("summary"),
        instructions: formData.get("instructions"),
        creator: formData.get("name"),
        creator_email: formData.get("email"),
        image,
      });

      // Mirrors the redirect("/meals") the Server Action ends with.
      router.push("/meals");
    } catch (submitError) {
      setError(submitError.message);
      setIsSaving(false);
    }
  }

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      <p className="demo-note">
        This is the static demo, so there is no server to post to. Your meal is
        saved in this browser only. Nobody else will see it, and clearing your
        site data removes it.
      </p>
      <div className={classes.row}>
        <p>
          <label htmlFor="name">Your name</label>
          <input type="text" id="name" name="name" required />
        </p>
        <p>
          <label htmlFor="email">Your email</label>
          <input type="email" id="email" name="email" required />
        </p>
      </div>
      <p>
        <label htmlFor="title">Title</label>
        <input type="text" id="title" name="title" required />
      </p>
      <p>
        <label htmlFor="summary">Short Summary</label>
        <input type="text" id="summary" name="summary" required />
      </p>
      <p>
        <label htmlFor="instructions">Instructions</label>
        <textarea
          id="instructions"
          name="instructions"
          rows="10"
          required
        ></textarea>
      </p>
      <ImagePicker label="your image" name="image" />
      {error && <p className="demo-error">{error}</p>}
      <p className={classes.actions}>
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Share Meal"}
        </button>
      </p>
    </form>
  );
}
