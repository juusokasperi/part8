import { useQuery, useMutation } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import { useState } from "react";
import Select from "react-select";

const Authors = ({ token }) => {
  const result = useQuery(ALL_AUTHORS);
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (result.loading) {
    return <div>Loading...</div>;
  }
  const authors = result.data.allAuthors;
  const selectOptions = authors.map((author) => ({
    label: author.name,
  }));

  const submit = async (event) => {
    event.preventDefault();
    editAuthor({
      variables: { name, born: Number(born) },
    });

    setName("");
    setBorn("");
  };

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token && (
        <>
          <h3>Set birthyear</h3>
          <form onSubmit={submit}>
            <div style={{ width: "30vw", marginBottom: "10px" }}>
              <Select
                options={selectOptions}
                onChange={(choice) => setName(choice.label)}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              born
              <input
                value={born}
                type="number"
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button type="submit">Update author</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Authors;
