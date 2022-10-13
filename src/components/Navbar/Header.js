import React, { useEffect, useRef, useState } from "react";
import {
  Navbar,
  Nav,
  Button,
  Modal,
  Dropdown,
  NavDropdown,
} from "react-bootstrap";
import { ethers } from "ethers";
import factory from "../../ethereum/factory";

const Header = ({ auth }) => {
  const [show, setShow] = useState(false);
  const [myAddress, setMyAddress] = useState("");
  const [myBalance, setBalance] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(async () => {
    connectMetamask();
    updateMetamaskAcc();
  }, []);

  const fetchUserInfo = async (address) => {
    try {
      const userInfo = await factory.methods.userMap(address).call();
      setUserInfo(userInfo);
    } catch (err) {
      console.log(err);
    }
  };

  const updateMetamaskAcc = async () => {
    window.ethereum.on("accountsChanged", async function () {
      // Time to reload your interface with accounts[0]!
      connectMetamask();
      // accounts = await web3.eth.getAccounts();
    });
  };

  const connectMetamask = () => {
    // Asking if metamask is already present or not
    if (window.ethereum) {
      // res[0] for fetching a first wallet
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => accountChangeHandler(res[0]));
    } else {
      alert("install metamask extension!!");
    }
  };

  const accountChangeHandler = (account) => {
    // Setting an address data
    if (account) {
      fetchUserInfo(account);
      setMyAddress(account);
      // Setting a balance
      getbalance(account);
    } else {
      setMyAddress("");
    }
  };

  const getbalance = (address) => {
    // Requesting balance method
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((_balance) => {
        if (_balance) {
          // Setting balance
          setBalance(ethers.utils.formatEther(_balance));
        }
      });
  };

  return (
    <div>
      <Navbar
        style={{ padding: "1rem 4rem" }}
        bg="dark"
        fixed="top"
        variant="dark"
        expand="lg"
      >
        <Navbar.Brand href="/home">DBATU FINANCE</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/home">Home</Nav.Link>
            <Nav.Link href="https://etherscan.io/">Etherscan</Nav.Link>
            {auth && <Nav.Link href="/members">Members</Nav.Link>}
            {auth && userInfo && (
              <NavDropdown
                id="nav-dropdown-light-example"
                title="Create"
                menuVariant="dark"
              >
                {userInfo.role === "LA" && (
                  <NavDropdown.Item href="/create">
                    Create Procurement
                  </NavDropdown.Item>
                )}
                {userInfo.role === "Owner" && (
                  <NavDropdown.Item href="/create-role">
                    Create Role
                  </NavDropdown.Item>
                )}
              </NavDropdown>
            )}
            <Nav.Link href="#" onClick={handleShow}>
              Wallet
            </Nav.Link>
            <NavDropdown
              id="nav-dropdown-light-example"
              title="Get Recommendation"
              menuVariant="dark"
            >
              <NavDropdown.Item href="/travel-grant">
                Travel Grant
              </NavDropdown.Item>

              <NavDropdown.Item href="/create-role">
                Procurement of equipment
              </NavDropdown.Item>
              <NavDropdown.Item href="/create-role">
                Leave Application
              </NavDropdown.Item>
              <NavDropdown.Item href="/create-role">
                Medical Bill
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="/notification">Notification</Nav.Link>
          </Nav>
          {myAddress !== "" && userInfo ? (
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                Connected as : {userInfo.name === "" ? "Viewer" : userInfo.name}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>
                  Name: {userInfo.name === "" ? "Viewer" : userInfo.name}
                  <Dropdown.ItemText>
                    Balance: {parseFloat(myBalance).toFixed(5)} Eth
                  </Dropdown.ItemText>
                </Dropdown.Header>
                <Dropdown.Item>
                  Role: {userInfo.role === "" ? "Viewer" : `${userInfo.role}`}
                </Dropdown.Item>
                <Dropdown.Item>
                  Approved Txs: {userInfo.approveCount}
                </Dropdown.Item>
                <Dropdown.Item>
                  Declined Txs: {userInfo.declineCount}
                </Dropdown.Item>
                <Dropdown.Item>Slipped Txs: {userInfo.slipCount}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Button onClick={connectMetamask}>Connect to Metamask</Button>
          )}
          {/* <Button variant="outline-success">Search</Button> */}
        </Navbar.Collapse>
      </Navbar>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Connected with Metamask, Address:
          {myAddress}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Connect
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Header;
