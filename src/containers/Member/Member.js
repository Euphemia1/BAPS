import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import web3 from "../../ethereum/web3";
import factory from "../../ethereum/factory";
import MemberItem from "./MemberItem";
import "./Member.css"

const Member = ({auth}) => {
  const [show, setShow] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [id, setId] = useState("");
  const [createAlert, setCreateAlert] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [index, setIndex] = useState(null);
  const [roleList, setRoleList] = useState([]);

  const handleClose = () => {
    setShow(false);
    setShowDelete(false);
    setCreateAlert(false);
  };
  const handleShow = () => setShow(true);

  const handleShowDelete = (number) => {
    setShowDelete(true);
    setIndex(number);
  };

  useEffect(async () => {
    fetchUserList();
    fetchRoleList();
  }, []);

  useEffect(() => {
    if(auth == false) {
        window.location.replace("/home")
    }
  }, [auth])

  const fetchRoleList = async () => {
    try {
      const _roleList = await factory.methods.listRoles().call();
      //   const filteredList = userList.filter(item => item.id !== "0x0000000000000000000000000000000000000000");
      setRoleList(_roleList);
      setRole(_roleList[0].role);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUserList = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      console.log(accounts[0]);
      const userList = await factory.methods.listUsers().call();
      const filteredList = userList.filter(
        (item) => item !== "0x0000000000000000000000000000000000000000"
      );
      setUsers(filteredList);
    } catch (err) {
      console.log(err);
    }
  };

  const createUser = async () => {
    if (name === "" || role === "" || id === "") {
      return setCreateAlert(true);
    }
    try {
      setCreateAlert(false);
      setCreating(true);
      const accounts = await web3.eth.getAccounts();
      const user = await factory.methods
        .createUser(role, id, name)
        .send({ from: accounts[0] });
      setCreating(false);
      setShow(false);
      fetchUserList();
    } catch (err) {
      console.log(err);
      setCreating(false);
    }
  };

  const deleteUser = async () => {
    try {
      if (!index) {
        return console.log("index cannot be null");
      }
      setDeleting(true);
      const accounts = await web3.eth.getAccounts();
      const deletedUser = await factory.methods.deleteUser(index).send({
        from: accounts[0],
      });
      setDeleting(false);
      setShowDelete(false);
      fetchUserList();
    } catch (err) {
      setDeleting(false);
      console.log(err);
    }
  };

  return (
    <div>
      <Container style={{ paddingTop: "2rem" }} className="text-left">
        <Row>
          <Col>
            <h2>All Members</h2>
          </Col>
          <Col style={{ textAlign: "right" }}>
            <Button onClick={handleShow}>Add Member</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Approved/Declined/Slipped</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length !== 0 &&
                  users.map((item, index) => (
                    <MemberItem
                      key={item.id + index}
                      item={item}
                      handleShowDelete={handleShowDelete}
                    />
                  ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createAlert && (
            <Alert key="1" variant="danger">
              No input should be empty!
            </Alert>
          )}
          <Form className="text-left">
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Member Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Sanil Gandhi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Member roles</Form.Label>
              <div>
                <select className="member-create-select" onChange={(e) => setRole(e.target.value)}>
                  {roleList.map((role) => (
                    <option value={role.role}>
                      {role.name} ({role.role})
                    </option>
                  ))}
                </select>
              </div>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Public Key</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. 0x3Ec8719804c7D39B71446E0edFe88893b128b24E"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            disabled={creating || name === "" || id === ""}
            onClick={!creating ? createUser : null}
            variant="primary"
          >
            {creating ? "Loading..." : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDelete} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure, You want to delete this member?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            disabled={deleting}
            variant="danger"
            onClick={!deleting ? deleteUser : null}
          >
            {!deleting ? "Delete" : "Loading..."}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Member;
