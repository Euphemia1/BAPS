import React from "react";
import LeftListFun from "../../functions/LeftListFun";
import TransactionItem from "../Items/TransactionItem";
import "./Home.css";
import { InputGroup, FormControl, Button } from "react-bootstrap";

const LeftList = ({items}) => {
  // const { items } = LeftListFun();
  let arr = [...items];
  let list = arr.reverse();
  

  return (
    <div className="home-left-list">
      <div style={{padding: '0 8px'}}>
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Search transaction by id"
            aria-label="Search transaction by id"
            aria-describedby="basic-addon2"
          />
          <Button variant="outline-secondary" id="button-addon2">
            Search
          </Button>
        </InputGroup>
      </div>
      <div className="home-left-list-container">
        {list.length !== 0 && list.map((item, index) => (
          <TransactionItem item={item} key={index + item.id} />
        ))}
      </div>
    </div>
  );
};

export default LeftList;
