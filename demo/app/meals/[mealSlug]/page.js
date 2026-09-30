import { notFound } from "next/navigation";

import MealDetail from "@/components/meals/meal-detail";
import { getSeedMeal, seedMeals } from "@/lib/seed-meals";

// Only the seeded slugs can be prerendered. A meal the visitor adds in the
// browser has no page here, so GitHub Pages serves 404.html for it and the
// client fallback in app/not-found.js renders it instead.
export function generateStaticParams() {
  return seedMeals.map((meal) => ({
    mealSlug: meal.slug,
  }));
}

export default function MealDetailsPage({ params }) {
  const meal = getSeedMeal(params.mealSlug);

  if (!meal) {
    notFound();
  }

  return <MealDetail meal={meal} />;
}
