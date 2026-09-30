"use client";

import { useEffect, useState } from "react";

import MealsGrid from "./meals-grid";
import { clearStoredMeals, getStoredMeals } from "@/lib/demo-store";

// Merges the build-time seed with whatever the visitor has added in this
// browser. The real app gets both from one SQLite query; a static export can
// only bake in the seed, so the rest is read after hydration.
export default function DemoMealsGrid({ seedMeals }) {
  // Starts empty on purpose. The server render and the first client render
  // must produce identical markup, or React 18 throws out the whole tree and
  // re-renders it on the client. The stored meals arrive in the effect below.
  const [storedMeals, setStoredMeals] = useState([]);

  useEffect(() => {
    setStoredMeals(getStoredMeals());
  }, []);

  function handleClear() {
    clearStoredMeals();
    setStoredMeals([]);
  }

  return (
    <>
      {storedMeals.length > 0 && (
        <p className="demo-note">
          {storedMeals.length === 1
            ? "1 meal below was added by you and is saved in this browser only."
            : `${storedMeals.length} meals below were added by you and are saved in this browser only.`}{" "}
          <button type="button" onClick={handleClear}>
            Remove {storedMeals.length === 1 ? "it" : "them"}
          </button>
        </p>
      )}
      <MealsGrid meals={[...seedMeals, ...storedMeals]} />
    </>
  );
}
