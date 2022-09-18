import React, {useEffect, useState} from "react";
import { Row, Col } from "react-bootstrap";
import LeftList from "../../components/Home/LeftList";
import RightInfo from "../../components/Home/RightInfo";
import { Route } from "react-router-dom";
import factory from "../../ethereum/factory";

const Home = ({auth}) => {

  const [transactions, setTransactions] = useState([]);
  //new
  useEffect(async () => {
    const transactionList = await factory.methods
    .listTransaction().call();
    setTransactions(transactionList)
  }, [])

  return (
    <div style={{ padding: "0 1rem" }}>
      <Row>
        <Col md={4}>
          <LeftList items={transactions} />
        </Col>
        <Col md={8}>
          <Route path="/home/:hash">
            <RightInfo isEmpty={false} auth={auth} />
          </Route>
          <Route path="/home/:" exact>
            <RightInfo isEmpty={true} auth={auth} />
          </Route>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
