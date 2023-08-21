import "./App.css";
import Header from "./components/Navbar/Header";
import Layout from "./containers/Layout";
import { BrowserRouter as Router, Redirect, Route } from "react-router-dom";
import { useEffect } from "react";
import web3 from "./ethereum/web3";
import factory from "./ethereum/factory";
import { useState } from "react";
import UnAuth from "./containers/UnAuth/UnAuth";
import { Spinner } from "react-bootstrap";

function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    let accounts;

    async function loadData() {
      try {
        accounts = await web3.eth.getAccounts();
        const isMember = await factory.methods
          .authMember()
          .call({ from: accounts[0] });
        setAuth(true);
      } catch (err) {
        setAuth(false);
        console.log(err);
      }
    }

    async function updateMetamaskAcc() {
      loadData();
      window.ethereum.on("accountsChanged", async function () {
        // Time to reload your interface with accounts[0]!
        loadData();
        // accounts = await web3.eth.getAccounts();
      });
    }
    updateMetamaskAcc();
  }, []);

  return (
    <div className="App">
      <div>
        <Header auth={auth} />
        <Router>
          <Route path="/BAPS">
            <Layout auth={auth} />
          </Route>
        </Router>
      </div>
      {/* {auth ? (
        <div>
          <Header />
          <Router>
            <Route path="/">
              <Layout />
            </Route>
          </Router>
        </div>
      ) : (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {auth == null ? (
            <Spinner animation="border" variant="primary" />
          ) : (
            <UnAuth />
          )}
        </div>
      )} */}
    </div>
  );
}

export default App;
