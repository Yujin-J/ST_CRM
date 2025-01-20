import React from "react";
import { Layout } from "antd";

const CustomLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Content style={{ padding: "16px" }}>
        {children}
      </Layout.Content>
    </Layout>
  );
};

export default CustomLayout;
