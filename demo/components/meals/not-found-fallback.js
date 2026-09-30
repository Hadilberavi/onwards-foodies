"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import MealDetail from "./meal-detail";
import { getStoredMeal } from "@/lib/demo-store";

// Recovers meal detail pages that cannot exist in a static export.
//
// generateStaticParams only prerenders the seeded slugs. A meal the visitor
// added lives in localStorage, so /meals/<their-slug>/ has no file and GitHub
// Pages answers with 404.html — which Next builds from app/not-found.js,
// complete with the client runtime. This component runs there, recognises the
// URL, and renders the meal instead of the error.
//
// It works for a typed URL, a reload, and an in-app click alike: when the
// router's RSC fetch for a missing route is not a 200 it performs a full
// browser navigation, which lands here too.
export default function NotFoundFallback() {
  const pathname = usePathname();

  // "checking" renders exactly the markup the build prerendered into 404.html,
  // so hydration matches. The lookup happens in the effect below.
  const [meal, setMeal] = useState(undefined);

  useEffect(() => {
    // usePathname() already strips basePath, so only the trailing slash that
    // trailingSlash:true adds needs removing. A hard navigation can also drop
    // it, so both shapes must parse.
    const path = pathname.replace(/\/+$/, "");
    const match = /^\/meals\/([^/]+)$/.exec(path);
    setMeal(match ? getStoredMeal(decodeURIComponent(match[1])) ?? null : null);
  }, [pathname]);

  if (meal) {
    return <MealDetail meal={meal} />;
  }

  // A /meals/<slug> URL that isn't in this browser is the shared-link case:
  // demo meals are local, so the visitor needs different wording.
  if (meal === null && /^\/meals\/[^/]+\/?$/.test(pathname)) {
    return (
      <main className="not-found">
        <h1>Not in this browser</h1>
        <p>
          Meals added in this demo are saved only on the device that created
          them, so a shared link will not show one.{" "}
          <Link href="/meals">Browse the meals →</Link>
        </p>
      </main>
    );
  }

  // Verbatim from the real app's app/not-found.js.
  return (
    <main className="not-found">
      <h1>An error occurred!</h1>
      <p>Faild to fetch. meal data Pleas try again later</p>
    </main>
  );
}
