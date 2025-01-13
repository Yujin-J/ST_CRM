import { Col, Row } from "antd";
import { CustomerForm } from "./form";

export const InteractionEditPage = () => {
  return (
    <div className="page-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} xl={12}>
          <CustomerForm />
        </Col>
      </Row>
    </div>
  );
};
