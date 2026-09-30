import classes from "./page.module.css";
import { getMeal, getMeals } from "@/lib/meals";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const meals = await getMeals();
  return meals.map((meal) => ({
    mealSlug: meal.slug,
  }));
}

export default function MealDetailsPage({ params }) {
  const meal = getMeal(params.mealSlug);
  if (!meal) {
    notFound();
  }
  meal.instructions = meal.instructions.replace(/\n/g, "<br />");
  return (
    //fill → parent div'in tamamını kapla demek
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
            __html: meal.instructions,
          }}
        ></p>
      </main>
    </>
  );
}
// لعرض النص المنسق،
