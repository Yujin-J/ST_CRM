import { Col, Row } from "antd";

import { InteractionTable } from "./contacts-table"; // 새 InteractionTable 컴포넌트
import { CustomerForm } from "./form";

export const ContactEditPage = () => {
  return (
    <div className="page-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} xl={12}>
          <CustomerForm />
        </Col>
        <Col xs={24} xl={12}>
          <InteractionTable /> {/* InteractionTable로 교체 */}
        </Col>
      </Row>
    </div>
  );
};
