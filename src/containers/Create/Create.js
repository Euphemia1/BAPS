import React from "react";
import { useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import sha256 from "sha256";
import factory from "../../ethereum/factory";
import web3 from "../../ethereum/web3";
import { uid } from "uid";
import ipfs from "../../ethereum/ipfs";


const Create = ({auth}) => {
  const [file, setFile] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [hash, setHash] = useState("");
  const [id, setId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if(auth == false) {
        window.location.replace("/home")
    }
  }, [auth])

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  function getImageBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => resolve({ buffer: Buffer(reader.result) });
      reader.onerror = (error) => reject(error);
    });
  }

  const createTransaction = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      let salt = "";
      let id = "";
      const accounts = await web3.eth.getAccounts();
      const imageBuffer = await getImageBuffer(file);
      const data = await getBase64(file);
      salt = sha256(data);
      setHash(salt);
      id = uid(24);
      setId(id);

      ipfs.add(imageBuffer.buffer, async (err, result) => {
        if (err) {
          console.log(err);
          setError("Error, ", err.message);
          return;
        }
        const docHash = result[0].hash;
        const transaction = await factory.methods
          .createTransaction(id, docHash, "default", comment, amount)
          .send({
            from: accounts[0],
          });
        const tx = transaction.transactionHash;
        setCreating(false);
        setFile("")
        setAmount("")
        setComment("")
        setSuccess(
          "Successfully created transaction by " +
            accounts[0] +
            " with transaction hash " +
            tx
        );
        setError("");
      });
    } catch (err) {
      setError("Error in creating transaction!");
      setSuccess("");
      setCreating(false);
      console.log(err);
    }
  };

  return (
    <Container style={{ paddingTop: "2rem" }} className="text-left">
      <h2>Create Transaction</h2>
      <Row>
        <Col>
          {(success !== "" || error !== "") && (
            <Alert key="1" variant={success !== "" ? "success" : "danger"}>
              {success !== "" ? success : error}
            </Alert>
          )}
          <Form className="text-left">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Transaction Id</Form.Label>
              <Form.Control
                type="email"
                placeholder="Transaction Id"
                value={id}
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
                placeholder="Transaction Hash"
                value={hash}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="e.g 15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Uploaded Document</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    onChange={(e) => setFile(e.target.files[0])}
                    type="file"
                  />
                </Col>
                <Col>
                  <Button size="sm" variant="secondary">
                    View File
                  </Button>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label>Add Comment</Form.Label>
              <Form.Control
                placeholder="Add any comment..."
                as="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={creating || amount === "" || file === ""}
              onClick={!creating ? createTransaction : null}
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
      </Row>
    </Container>
  );
};

export default Create;
