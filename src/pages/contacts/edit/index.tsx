import { Col, Row } from "antd";

import { ContactContactsTable } from "./contacts-table";
import { ContactForm } from "./form";

export const ContactEditPage = () => {
  return (
    <div className="page-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} xl={12}>
          <ContactForm />
        </Col>
        <Col xs={24} xl={12}>
          <ContactContactsTable />
        </Col>
      </Row>
    </div>
  );
};
