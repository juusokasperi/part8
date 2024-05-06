import { useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { ALL_BOOKS, ME } from "../queries";

const Recommended = () => {
  const [favoriteGenre, setFavoriteGenre] = useState(null);

  const { data: userData, loading: userLoading } = useQuery(ME);
  const { data: booksData, loading: booksLoading } = useQuery(ALL_BOOKS, {
    skip: !favoriteGenre,
    variables: { genre: favoriteGenre },
  });

  useEffect(() => {
    if (userData && userData.me) {
      setFavoriteGenre(userData.me.favoriteGenre);
    }
  }, [userData]);

  if (userLoading || booksLoading) {
    return <div>Loading..</div>;
  }

  if (!booksData || !booksData.allBooks) {
    return <div>No books found for the favorite genre.</div>;
  }

  const books = booksData.allBooks;

  return (
    <div>
      <h2>Recommended for you</h2>
      <i>
        Based on your favorite genre <b>{favoriteGenre}</b>
      </i>

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
    </div>
  );
};

export default Recommended;
