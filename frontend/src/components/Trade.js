import React, {useState} from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import Axios from "axios";

export function Trade(props) {
  const [show, setShow] = useState(false);
  const [addr, setAddr] = useState("");
  const [resolvedAddr, setResolvedAddr] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleConfirm = () => {
    props.callbackFunction(resolvedAddr.toString());
    setShow(false);
  }

  const handleChange = (e) => {
    setAddr(e.target.value);
    const url = `https://unstoppabledomains.g.alchemy.com/domains/${e.target.value}`;
    Axios.get(url, {
      headers: { Authorization: `Bearer ${process.env.REACT_APP_ALCHEMY_API}` },
    }).then((res) => {
      setResolvedAddr(res.data.records["crypto.ETH.address"]);
    });
  }


  return (
    <>
      <Button variant="danger" onClick={handleShow}>
        Trade Your Pokemon Card 💸
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Trade Your Pokemon Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Unstopabble Domain</Form.Label>
              <Form.Control

                type="input"
                placeholder="brad.crypto"
                autoFocus
                value={addr}
                onChange={handleChange}
              />
              <Form.Label style={{color:"grey", fontSize:"small"}}>{resolvedAddr}</Form.Label>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
