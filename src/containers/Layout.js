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
      <Route path={process.env.PUBLIC_URL + "/BAPS/home"} >
        <Home auth={auth} />
      </Route>
      <Route path={process.env.PUBLIC_URL + "/BAPS/create"}>
        <Create auth={auth} />
      </Route>
      <Route path={process.env.PUBLIC_URL + "/BAPS/create-role"}>
        <CreateRole auth={auth} />
      </Route>
      <Route path={process.env.PUBLIC_URL + "/BAPS/members"}>
        <Member auth={auth} />
      </Route>
      <Route path={process.env.PUBLIC_URL + "/BAPS/notification"}>
        <Notification auth={auth} />
      </Route>
    </div>
  );
};

export default Layout;
