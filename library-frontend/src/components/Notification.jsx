const Notification = ({ notification }) => {
  const style = {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f0fff9",
    border: "3px double #7ca395",
    borderRadius: 5,
  };

  if (notification === "") {
    return null;
  } else {
    return <div style={style}>{notification}</div>;
  }
};

export default Notification;
