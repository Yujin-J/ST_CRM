import { Col, Row } from "antd";

import { CustomerContactsTable } from "./contacts-table";
import { CustomerForm } from "./form";

export const CustomerEditPage = () => {
  return (
    <div className="page-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} xl={12}>
          <CustomerForm />
        </Col>
        <Col xs={24} xl={12}>
          <CustomerContactsTable />
        </Col>
      </Row>
    </div>
  );
};
