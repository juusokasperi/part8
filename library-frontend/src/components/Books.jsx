import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { useState } from "react";

const Books = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const { data, loading } = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
  });

  const allBooksData = useQuery(ALL_BOOKS);

  if (loading || allBooksData.loading) {
    return <div>Loading..</div>;
  }

  const books = data.allBooks;

  const genres = [
    ...new Set(allBooksData.data.allBooks.map((book) => book.genres).flat()),
  ];

  return (
    <div>
      <h2>Books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setSelectedGenre(null)}>All Genres</button>
      </div>
    </div>
  );
};

export default Books;
