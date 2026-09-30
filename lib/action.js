"use server"; /// server action
import { saveMeal } from "./meals";
import { redirect } from "next/navigation";
// function that only. excute. on the server. ,, in here we make form submition with help. server actions
export async function shareMeal(fromData) {
  const meal = {
    title: fromData.get("title"),
    summary: fromData.get("summary"),
    instructions: fromData.get("instructions"),
    image: fromData.get("image"),
    creator: fromData.get("name"),
    creator_email: fromData.get("email"),
  };

  await saveMeal(meal); // storing data in database
  redirect("/meals");
}
