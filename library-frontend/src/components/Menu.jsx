import { Link } from "react-router-dom";

const Menu = ({ logout, token }) => {
  const padding = {
    textDecoration: "none",
    color: "black",
    paddingRight: 5,
  };
  const style = {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f0fff9",
    border: "3px double #7ca395",
    borderRadius: 5,
    font: "18px Monaco",
    fontVariantCaps: "all-small-caps",
  };

  return (
    <div style={style}>
      <Link style={padding} to="/">
        Authors
      </Link>
      <Link style={padding} to="/books">
        Books
      </Link>
      {token && (
        <>
          <Link style={padding} to="/recommended">
            Recommendations
          </Link>
          <Link style={padding} to="/new">
            Add book
          </Link>
          <button onClick={logout}>Log out</button>
        </>
      )}
      {!token && (
        <Link style={padding} to="/login">
          Login
        </Link>
      )}
    </div>
  );
};

export default Menu;
