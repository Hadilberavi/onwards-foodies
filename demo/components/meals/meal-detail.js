import Image from "next/image";

import classes from "./meal-detail.module.css";

// Extracted from the real app's app/meals/[mealSlug]/page.js so that the same
// markup serves two callers: the statically generated detail page, and the
// client-side fallback in app/not-found.js that renders meals a visitor added
// to localStorage (those slugs have no page of their own in a static export).
//
// This component deliberately owns its CSS import. 404.html only ships the CSS
// its own route pulls in, so if the styles lived on the detail page instead,
// a localStorage meal would render completely unstyled.
//
// No "use client" directive: that lets it render on the server for the 11
// prerendered meals and on the client for the fallback.
export default function MealDetail({ meal }) {
  // The real app mutates meal.instructions in place. Here the seed array is
  // module-level and stored meals come straight out of localStorage, so a
  // local value is used instead of writing back into shared state.
  const instructions = (meal.instructions ?? "").replace(/\n/g, "<br />");

  return (
    <>
      <header className={classes.header}>
        <div className={classes.image}>
          <Image src={meal.image} alt={meal.title} fill />
        </div>
        <div className={classes.headerText}>
          <h1>{meal.title}</h1>
          <p className={classes.creator}>
            by <a href={`mailto:${meal.creator_email}`}>{meal.creator}</a>
          </p>
          <p className={classes.summary}>{meal.summary}</p>
        </div>
      </header>
      <main>
        <p
          className={classes.instructions}
          dangerouslySetInnerHTML={{
            __html: instructions,
          }}
        ></p>
      </main>
    </>
  );
}
