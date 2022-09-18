import React from "react";
import { Badge, Card, Button } from "react-bootstrap";
import {Link} from 'react-router-dom'

const TransactionItem = ({ item }) => {
  return (
    <Card
      style={{ margin: "8px", marginTop: "0" }}
      className="text-left"
      border="warning"
    >
      <Card.Header>ID: {item.id}</Card.Header>
      <Card.Body>
        <Card.Text>{item.docHash}</Card.Text>
        <Card.Text>Comment: {item.comment}</Card.Text>
        <Card.Text>Amount: Rs {item.amount}</Card.Text>
        <Link to={`/BAPS/home/${item.docHash}`}>
        <Button variant="primary">View Details</Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

export default TransactionItem;
