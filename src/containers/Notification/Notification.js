import React, { useEffect, useState } from "react";
import "./Nots.css";
import { ListGroup, Badge } from "react-bootstrap";
import factory from "../../ethereum/factory";

const Notification = () => {
  const [nots, setNots] = useState([]);
  //new
  useEffect(async () => {
    let list = await factory.methods.listNotification().call();
    let arr = [...list];
    let ns = arr.reverse();
    setNots(ns);
  }, []);

  return (
    <div className="nots">
      {nots.length > 0 &&
        nots.map((item, index) => {
          let variant;
          if (item.status === "create") {
            variant = "warning";
          } else if (item.status === "pending") {
            variant = "success";
          } else {
            variant = "primary";
          }

          return (
            <ListGroup as="ol" numbered>
              <ListGroup.Item
                as="li"
                variant={variant}
                className="d-flex mb-2 justify-content-between align-items-start"
              >
                <div className="ms-2 me-auto d-flex flex-column align-items-start">
                  <h5 className="fw-bold">{item.title}</h5>
                  <p>{item.message}</p>
                </div>
                <Badge variant="primary" pill>
                  {index + 1}
                </Badge>
              </ListGroup.Item>
            </ListGroup>
          );
        })}
    </div>
  );
};

export default Notification;
