import classes from "./meals-grid.module.css";
import MealItem from "./meal-item";
export default function MealsGrid({ meals }) {
  return (
    <>
      <ul className={classes.meals}>
        {meals.map((meal) => (
          <li key={meal.id}>
            <MealItem {...meal} />
          </li>
        ))}
      </ul>
    </>
  );
}
// {...meal} to. pull up all the. properties of. meals spret them on to the mealitem
