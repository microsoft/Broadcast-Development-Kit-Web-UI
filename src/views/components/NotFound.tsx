import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC<any> = () => {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>404 - Not Found </h1>
      <h2>Sorry we can’t find that page. </h2>
      <h3>Maybe the page you are looking for has been removed, or you typed in the wrong URL.</h3>
      <Link to="/login">Go Home</Link>
    </div>
  );
};

export default NotFound;