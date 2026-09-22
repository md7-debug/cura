// Candidates only. Publication still requires work-, edition-, and translation-level review.
export const requestedVoices = Object.freeze([
  { deathYear: 1327, id: "meister-eckhart", name: "Meister Eckhart", status: "edition-review" },
  { deathYear: 430, id: "saint-augustine", name: "Saint Augustine", status: "edition-review" },
  { deathYear: 1499, id: "marsilio-ficino", name: "Marsilio Ficino", status: "edition-review" },
]);

export const requestedWorks = Object.freeze([
  {
    authorId: "thoreau",
    author: "Henry David Thoreau",
    titles: ["Civil Disobedience", "Walking", "Life Without Principle"],
    status: "exact-edition-review",
  },
  {
    authorId: "emerson",
    author: "Ralph Waldo Emerson",
    titles: [
      "Nature", "History", "Compensation", "The Over-Soul", "Circles", "The Poet",
      "Experience", "Politics", "New England Reformers", "Saadi", "The American Scholar",
      "Fate", "Spiritual Laws", "Prudence", "Heroism", "Love", "Friendship", "Intellect",
    ],
    status: "exact-edition-review",
  },
]);
