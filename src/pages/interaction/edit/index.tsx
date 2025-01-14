import { Col, Row } from "antd";
import { InteractionEdit } from "./form";

export const InteractionEditPage = () => {
  return (
    <div className="page-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} xl={12}>
          <InteractionEdit />
        </Col>
      </Row>
    </div>
  );
};
