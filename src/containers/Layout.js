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
      <Route path="/BAPS/home" >
        <Home auth={auth} />
      </Route>
      <Route path="/BAPS/create">
        <Create auth={auth} />
      </Route>
      <Route path="/BAPS/create-role">
        <CreateRole auth={auth} />
      </Route>
      <Route path="/BAPS/members">
        <Member auth={auth} />
      </Route>
      <Route path="/BAPS/notification">
        <Notification auth={auth} />
      </Route>
    </div>
  );
};

export default Layout;
