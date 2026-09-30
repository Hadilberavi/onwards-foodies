import sql from "better-sqlite3";
import slugify from "slugify"; // convert the text to slug
import xss from "xss"; //
import fs from "node:fs"; //
import { error } from "node:console";
const db = sql("meals.db");

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  //throw new Error("Loding meals failed");
  return db.prepare("SELECT * FROM meals").all();
}

export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}
// we want to. generate a slug based on. the. title  for  every meal and
export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;

  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();
  // convert image to buffer
  stream.write(Buffer.from(bufferedImage), () => (error) => {
    if (error) {
      throw new Error("saving image faild!");
    }
  });
  // edit image value to storing url in database
  meal.image = `/images/${fileName}`;

  db.prepare(
    `
    INSERT INTO meals
     (title, summary, instructions, creator,creator_email,image, slug)
     VALUES (
         @title,
         @summary,
         @instructions,
         @creator,
         @creator_email,
         @image,
         @slug
         )
  `,
  ).run(meal);
}
