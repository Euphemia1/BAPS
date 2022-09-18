import React from "react";
import Home from "./Home/Home";
import { Route } from "react-router-dom";
import Create from "./Create/Create";
import Member from './Member/Member'
import Notification from "./Notification/Notification";
import CreateRole from "./Create/CreateRole";

const Layout = ({auth}) => {
  return (
    <div style={{ paddingTop: "4.5rem" }}>
      <Route path="/home" >
        <Home auth={auth} />
      </Route>
      <Route path="/create">
        <Create auth={auth} />
      </Route>
      <Route path="/create-role">
        <CreateRole auth={auth} />
      </Route>
      <Route path="/members">
        <Member auth={auth} />
      </Route>
      <Route path="/notification">
        <Notification auth={auth} />
      </Route>
    </div>
  );
};

export default Layout;
