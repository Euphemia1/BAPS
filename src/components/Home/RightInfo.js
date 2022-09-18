import React from "react";
import { useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import Countdown from "react-countdown";

import { useParams } from "react-router-dom";
import Empty from "../../assets/empty_data_set.png";
import "./Home.css";
import factory from "../../ethereum/factory";
import web3 from "../../ethereum/web3";
import { useState } from "react";

const RightInfo = ({ isEmpty, auth }) => {
  const { hash } = useParams();

  const [item, setItem] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [approving, setApproving] = useState(false);
  const [isApproved, setApproved] = useState(false);
  const [isDeclined, setDeclined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eligible, setEligible] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [isWaiting, setWaiting] = useState(false);
  const [isExpired, setExpired] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    loadData(hash);
    updateMetamaskAcc(hash);
  }, [hash]);

  const loadData = async (hash) => {
    setUserInfo(null);
    setItem(null);
    setApprovals([]);
    setApproved(false);
    setDeclined(false);
    setWaiting(false);
    setLoading(true);

    setLoadingText("Validating tx...");
    await factory.methods.validateTxDuration(hash).call();

    setLoadingText("Fetching user info...");
    const accounts = await web3.eth.getAccounts();
    //fetch user info
    const _userInfo = await factory.methods.userMap(accounts[0]).call();
    setUserInfo(_userInfo);

    setLoadingText("Fetching tx info...");
    // fetch tx info
    const trans = await factory.methods.transactionMap(hash).call();
    setItem(trans);

    // fetch tx approvals info
    const app = await factory.methods.listApprovals(hash).call();
    const approvalList = app.approvalList;
    setApprovals(approvalList);

    setLoadingText("Finalizing the tx...");
    // check if already approved or declined
    const appAlreadyList = approvalList.filter((a) => a.id === _userInfo.id);
    if (trans.status === "EXPIRED") {
      setExpired(true);
    } else if (trans.status === "DECLINED") {
      if (appAlreadyList.length > 0) {
        setApproved(true);
      } else {
        setDeclined(true);
      }
    } else if (
      trans.status === "PENDING" &&
      trans.currentApprovalRole !== _userInfo.role
    ) {
      setWaiting(true);
    } else if (trans.status === "PENDING") {
      if (appAlreadyList.length > 0) {
        setApproved(true);
      }
    }
    setLoadingText("");
    setLoading(false);
  };

  const fetchUserInfo = async (address) => {
    try {
      const _userInfo = await factory.methods.userMap(address).call();
      setUserInfo(_userInfo);
    } catch (err) {
      console.log(err);
    }
  };

  const updateMetamaskAcc = async (hash) => {
    window.ethereum.on("accountsChanged", async function () {
      // Time to reload your interface with accounts[0]!
      loadData(hash);
      // accounts = await web3.eth.getAccounts();
    });
  };

  const approveTransaction = async (e) => {
    e.preventDefault();
    try {
      setApproving(true);
      const accounts = await web3.eth.getAccounts();
      const approveTrans = await factory.methods
        .approveTransaction(hash)
        .send({ from: accounts[0] });
      setApproving(false);
      setApproved(true);
      setDeclined(false);
      loadData(hash);
    } catch (err) {
      setApproving(false);
      console.log(err);
    }
  };

  const declineTransaction = async (e) => {
    e.preventDefault();
    try {
      setApproving(true);
      const accounts = await web3.eth.getAccounts();
      const declineTx = await factory.methods
        .declineTransaction(hash)
        .send({ from: accounts[0] });
      setApproving(false);
      setDeclined(true);
      setApproved(false);
      loadData(hash);
    } catch (err) {
      setApproving(false);
      console.log(err);
    }
  };

  const [show, setShow] = useState(false);
  const [info, setInfo] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = async (item) => {
    setInfo(null);
    setShow(true);
    const userInfo = await factory.methods.userMap(item.id).call();
    setInfo(userInfo);
  };

  const handleOpenImage = () => {
    window.open(`https://gateway.ipfs.io/ipfs/${hash}`);
  };

  const windowTime = (item, user) => {
    const createdTime = parseInt(item.timestamp) * 1000;
    const day = 86400000;
    switch (user.role) {
      case "LA":
        return 0;
      case "HOD":
        return createdTime + day;
      case "FO":
        return createdTime + 3 * day;
      case "REG":
        return createdTime + 5 * day;
      case "VC":
        return createdTime + 7 * day;
      case "CC":
        return createdTime + 10 * day;
      default:
        return 0;
    }
  };

  // Renderer callback with condition
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <p>Time Window Closed!</p>;
    } else {
      // Render a countdown
      return (
        <div>
          <p>
            <span>
              <strong>{days}:</strong>
              <strong>{hours}:</strong>
              <strong>{minutes}:</strong>
              <strong>{seconds}</strong>
            </span>{" "}
            Hours
          </p>
        </div>
      );
    }
  };

  return (
    <Container className="home-right-info">
      {isEmpty ? (
        <img src={Empty} alt="no data" />
      ) : (
        <div
          style={{
            minHeight: "85vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading || !item || !userInfo ? (
            <div>
              <Spinner animation="border" variant="primary" />
              <h5>{loadingText}</h5>
            </div>
          ) : (
            <Form className="text-left">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Transaction Id</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Transaction Id"
                  value={item ? item.id : ""}
                  readOnly
                />
                <Form.Text className="text-muted">
                  Uniquely generated transaction id at the time when transaction
                  has been created, This id will never change
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Document Hash</Form.Label>
                <Form.Control
                  readOnly
                  type="text"
                  placeholder="Document Hash"
                  value={hash ? hash : ""}
                />
              </Form.Group>

              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Uploaded Document</Form.Label>
                <Row>
                  {/* <Col>
                    <Form.Control type="file" disabled />
                  </Col> */}
                  <Col>
                    <Button
                      onClick={handleOpenImage}
                      size="sm"
                      disabled={!auth}
                      variant="secondary"
                    >
                      View File
                    </Button>
                  </Col>
                  {item.status === "APPROVED" ||
                  item.status === "DECLINED" ||
                  item.status === "EXPIRED" ? (
                    ""
                  ) : (
                    <Col>
                      <Countdown
                        renderer={renderer}
                        date={windowTime(item, userInfo)}
                      />
                    </Col>
                  )}
                  <Col>
                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <Button
                        size="sm"
                        variant={
                          item.status === "DECLINED" ? "danger" : "success"
                        }
                      >
                        Amount: Rs {item ? item.amount : "Loading..."}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="exampleForm.ControlTextarea1">
                <Form.Label>Add Comment</Form.Label>
                <Form.Control
                  placeholder="Add any comment..."
                  as="textarea"
                  readOnly
                  value={item ? item.comment : ""}
                  rows={3}
                />
              </Form.Group>
              <Form.Group controlId="exampleForm.ControlSelect2">
                <Form.Label>Approved by</Form.Label>
                <Form.Control className="approval-list" as="div" multiple>
                  {approvals.length > 0 ? (
                    approvals.map((item, index) => (
                      <div
                        className="approval-item"
                        // key={item.id}
                        key={item}
                      >
                        {/* {`${item.firstName} ${item.lastName} [${item.role}]`} */}
                        <p>{item.name}</p>
                        <p
                          style={{ color: "blue", cursor: "pointer" }}
                          onClick={() => handleShow(item)}
                        >
                          More Info
                        </p>
                      </div>
                    ))
                  ) : (
                    <option key={"loading"}>Loading...</option>
                  )}
                </Form.Control>
              </Form.Group>
              {item.status === "APPROVED" && (
                <Alert key="1" variant="success">
                  The transaction has been approved by all the authorities
                </Alert>
              )}
              {item.status === "DECLINED" && (
                <Alert key="5" variant="danger">
                  The transaction has been declined by{" "}
                  {item.currentApprovalRole}.
                </Alert>
              )}
              {item.status === "EXPIRED" && (
                <Alert key="7" variant="danger">
                  The transaction is expired and the approval window is closed.{" "}
                  {item.currentApprovalRole}.
                </Alert>
              )}
              {isWaiting && (
                <Alert key="6" variant="warning">
                  Wait for {item.currentApprovalRole} to approve the transaction
                </Alert>
              )}
              {isApproved && (
                <Button disabled variant="success">
                  Approved
                </Button>
              )}
              {isDeclined && (
                <Button disabled variant="danger">
                  Declined
                </Button>
              )}
              {item.status === "PENDING" && !isWaiting && (
                <div>
                  {!isApproved && !isDeclined && (
                    <>
                      {auth &&
                        userInfo &&
                        userInfo.role !== "LA" &&
                        userInfo.role !== "Owner" && (
                          <div>
                            <Button
                              disabled={approving}
                              onClick={!approving ? approveTransaction : null}
                              variant="primary"
                              type="submit"
                            >
                              {!approving
                                ? "Approve Transaction"
                                : "Loading..."}
                            </Button>
                            <Button
                              style={{ marginLeft: "1rem" }}
                              disabled={approving}
                              onClick={!approving ? declineTransaction : null}
                              variant="danger"
                              type="submit"
                            >
                              {!approving ? "Decline" : "Loading..."}
                            </Button>
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </Form>
          )}
        </div>
      )}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Approval Info</Modal.Title>
        </Modal.Header>
        {info ? (
          <Modal.Body>
            <p className="modal-para">
              <span>Address:</span> {info.id}
            </p>
            <p className="modal-para">
              <span>Name:</span> {info.name}
            </p>
            <p className="modal-para">
              <span>Role:</span> {info.role}
            </p>
            <p className="modal-para">
              <span>Approved Txs:</span> {info.approveCount}
            </p>
            <p className="modal-para">
              <span>Declined Txs:</span> Rs {info.declineCount}
            </p>
            <p className="modal-para">
              <span>Slipped Txs:</span> Rs {info.slipCount}
            </p>
          </Modal.Body>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              minHeight: "100px",
              alignItems: "center",
            }}
          >
            <Spinner animation="border" variant="primary" />
          </div>
        )}
      </Modal>
    </Container>
  );
};

export default RightInfo;
