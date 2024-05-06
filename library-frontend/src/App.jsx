import { useState, useEffect } from "react";
import { useApolloClient, useSubscription } from "@apollo/client";
import { BOOK_ADDED, ALL_BOOKS } from "./queries";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Recommended from "./components/Recommended";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Menu from "./components/Menu";
import Notification from "./components/Notification";
import { Routes, Route, useNavigate } from "react-router-dom";

const App = () => {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState("");
  const client = useApolloClient();
  const navigate = useNavigate();

  const notifyWith = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 5000);
  };

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      console.log(addedBook);
      notifyWith(`Book ${addedBook.title} by ${addedBook.author.name} added`);
    },
  });

  useEffect(() => {
    const cacheToken = window.localStorage.getItem("library-user-token");
    if (cacheToken) setToken(cacheToken);
  }, []);

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    navigate("/");
  };

  const wrapper = {
    width: "70vw",
    margin: "auto",
    backgroundColor: "#f7faf9",
    padding: 20,
    border: "5px double #9eb5ad",
    borderRadius: 2,
    boxShadow: "10px 5px grey",
  };

  return (
    <div style={wrapper}>
      <Notification notification={notification} />
      <div>
        <Menu logout={logout} token={token} />
      </div>
      <Routes>
        <Route path="/" element={<Authors token={token} />} />
        <Route path="/books" element={<Books />} />
        <Route path="/new" element={<NewBook />} />
        <Route path="/recommended" element={<Recommended />} />
        <Route
          path="/login"
          element={<LoginForm setToken={setToken} navigate={navigate} />}
        />
      </Routes>
    </div>
  );
};

export default App;
