import React from "react";
import { Layout as AntdLayout } from "antd";

const CustomLayout: React.FC = ({ children }) => {
  return (
    <AntdLayout style={{ minHeight: "100vh" }}>
      {/* 헤더를 유지하려면 여기에 추가 가능 */}
      <AntdLayout.Content style={{ padding: "16px" }}>
        {children}
      </AntdLayout.Content>
    </AntdLayout>
  );
};

export default CustomLayout;