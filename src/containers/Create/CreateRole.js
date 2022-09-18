import React, { useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Table,
} from "react-bootstrap";
import { useState } from "react";
import factory from "../../ethereum/factory";
import web3 from "../../ethereum/web3";

const CreateRole = ({auth}) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoleList()
    if(auth == false) {
        window.location.replace("/BAPS/home")
    }
  }, [auth])

  
  const fetchRoleList = async () => {
    try {
      const roleList = await factory.methods.listRoles().call();
    //   const filteredList = userList.filter(item => item.id !== "0x0000000000000000000000000000000000000000");
      setRoles(roleList);
      console.log(roleList);
    } catch (err) {
      console.log(err);
    }
  };

  const createRole = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const accounts = await web3.eth.getAccounts();
      const myAccount = accounts[0];

      const createdRole = await factory.methods
        .createRole(id, name, maxAmount, minAmount)
        .send({
          from: myAccount,
        });
      const tx = createdRole.transactionHash;
      setCreating(false);
      setSuccess("Successfully created Role " + id + " with tx hash  " + tx);
      fetchRoleList()
    } catch (err) {
      setError("Error in creating role!");
      setSuccess("");
      setCreating(false);
      console.log(err);
    }
  };

  const handleDeleteRole = () => {

  }

  return (
    <Container style={{ paddingTop: "2rem" }} className="text-left">
      <h2>Create Role</h2>
      <Row>
        <Col>
          {(success !== "" || error !== "") && (
            <Alert key="1" variant={success !== "" ? "success" : "danger"}>
              {success !== "" ? success : error}
            </Alert>
          )}
          <Form className="text-left">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Role Id</Form.Label>
              <Form.Control
                type="email"
                placeholder="Role Id"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
              <Form.Text className="text-muted">
                Unique id for the role LA, HOD, FO, REG, VC, CC
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Role Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Maximum Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Maximum Amount"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Minimum Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Minimum Amount"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={
                creating ||
                id === "" ||
                name === "" ||
                maxAmount === "" ||
                minAmount === ""
              }
              onClick={!creating ? createRole : null}
            >
              {!creating ? "Create" : "Loading..."}
            </Button>
            <Button
              style={{ marginLeft: "1rem" }}
              variant="outline-danger"
              type="submit"
            >
              Cancel
            </Button>
          </Form>
        </Col>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Role Id</th>
                <th>Role Name</th>
                <th>Max Amount</th>
                <th>Min Amount</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {roles.length !== 0 &&
                roles.map((item, index) => (
                  <tr key={item.role + index}>
                    <td>{item.number}</td>
                    <td>{item.role}</td>
                    <td>{item.name}</td>
                    <td>{item.maxAmount}</td>
                    <td>Rs {item.minAmount}</td>
                    {/* <td>
                      <Button
                        onClick={() => handleDeleteRole(item.role)}
                        variant="outline-danger"
                      >
                        Delete
                      </Button>
                    </td> */}
                  </tr>
                ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateRole;
