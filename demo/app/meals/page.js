import Link from "next/link";

import classes from "./page.module.css";
import DemoMealsGrid from "@/components/meals/demo-meals-grid";
import { seedMeals } from "@/lib/seed-meals";

// The real app awaits getMeals() from SQLite and streams the grid inside
// <Suspense>. Here the meals are baked in at build time, so there is nothing
// to await and no loading state to show.
export default function MealsPage() {
  return (
    <>
      <header className={classes.header}>
        <h1>
          Delicious meals, created
          <span className={classes.highlight}> by you </span>
        </h1>
        <p>
          choose your favorite recipe and cook it yourself. It is easy and fun!
        </p>

        <p className={classes.cta}>
          <Link href="/meals/share">Share Your Favorite Recipe</Link>
        </p>
      </header>
      <main className={classes.main}>
        <DemoMealsGrid seedMeals={seedMeals} />
      </main>
    </>
  );
}
