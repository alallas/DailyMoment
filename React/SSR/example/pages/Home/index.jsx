import React from "react";
const Home = () => {
  return (
    <div>
      <h2 onClick={() => console.log("hello")}>This is Home Page</h2>
      <p className="title">Home is the page ..... more discribe</p>
    </div>
  );
};
export default Home;