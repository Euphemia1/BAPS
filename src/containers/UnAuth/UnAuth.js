import React from "react";
import "./UnAuth.css";

const UnAuth = () => {

  return (
    <div id="notfound">
      <div className="notfound">
        <div className="notfound-404"></div>
        <h1>404</h1>
        <h2>Oops! UnAuthorized Access</h2>
        <p>
          Sorry you are not authorized to access this portal, If you are member
          of this portal then you should select your public key as your primary
          key from the metamask extension.
        </p>
        {/* <a href="#">
          Connect
        </a> */}
      </div>
    </div>
  );
};

export default UnAuth;
