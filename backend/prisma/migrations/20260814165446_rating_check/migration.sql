-- Enforce that a rating is always an integer between 1 and 5 at the database level.
ALTER TABLE "ratings"
  ADD CONSTRAINT "ratings_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);