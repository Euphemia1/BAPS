import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import factory from "../../ethereum/factory";

const MemberItem = ({ item, handleShowDelete }) => {
  const [data, setData] = useState(null);

  useEffect(async () => {
    const userInfo = await factory.methods.userMap(item).call();
    setData(userInfo);
  }, [item]);

  return (
    <tr>
      <td>{data && data.number}</td>
      <td>{data && data.name}</td>
      <td>{data && data.role}</td>
      <td>
        {data && data.approveCount} / {data && data.declineCount} /{" "}
        {data && data.slipCount}
      </td>
      <td>{data && data.id}</td>
      <td>
        {data && data.id !== "0x0000000000000000000000000000000000000000" && (
          <Button
            onClick={() => handleShowDelete(data && data.number)}
            variant="outline-danger"
          >
            Delete
          </Button>
        )}
      </td>
    </tr>
  );
};

export default MemberItem;
