import React, { useState } from "react";
import { Refine } from "@refinedev/core";
import { RefineThemes } from "@refinedev/antd";
import {
  DashboardOutlined,
  ShopOutlined,
  ContactsOutlined,
  CommentOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter, Link } from "react-router-dom";

import {
  Layout,
  ConfigProvider,
  Drawer,
  Menu,
  message,
  Button,
} from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import {
  firebaseAuth,
  firestoreDataProvider,
  base_auth
} from "./helpers/firebase/firebaseConfig";
import "@refinedev/antd/dist/reset.css";
import NotificationComponent from "./notification/NotificationComponent";
import Chatbot from "./chatbot/Chatbot";
import { AppRoutes } from "./routes";
import logoImage from "./assets/icons/ST_United.jpg";
import CustomLayout from "./custom";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const handleLogout = async (e) => {
    e.preventDefault(); // 기본 동작 차단
    try {
      console.log("Attempting to log out...");
      await base_auth.signOut();
      message.success("Successfully logged out!");
      setTimeout(() => {
        window.location.href = "/login"; // 로그아웃 후 로그인 페이지로 리다이렉션
      }, 500);
    } catch (error) {
      console.error("Logout failed", error);
      message.error("Failed to log out. Please try again.");
    }
  };
  

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider theme={RefineThemes.Blue}>
          <Layout style={{ minHeight: "100vh" }}>
            <Layout.Sider theme="light" collapsible>
            <div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
              <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                  <img
                    src={logoImage}
                    alt="CRM Logo"
                    style={{ height: "40px", marginRight: "8px" }}
                  />
                  <span style={{ fontSize: "20px", fontWeight: "bold", color: "#000" }}>
                    CRM
                  </span>
                </Link>
              </div>
              <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={(e) => setSelectedKey(e.key)}
                style={{ height: "100%" }}
              >
                <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                  <Link to="/">Dashboard</Link>
                </Menu.Item>
                <Menu.Item key="customers" icon={<ShopOutlined />}>
                  <Link to="/customers">Customers</Link>
                </Menu.Item>
                <Menu.Item key="contacts" icon={<ContactsOutlined />}>
                  <Link to="/contacts">Contacts</Link>
                </Menu.Item>
                <Menu.Item key="interaction" icon={<CommentOutlined />}>
                  <Link to="/interaction">Interaction</Link>
                </Menu.Item>
                <Menu.Item
                  key="notifications"
                  icon={<BellOutlined />}
                  onClick={toggleDrawer}
                >
                  Notifications
                </Menu.Item>
                <Menu.Item
                  key="logout"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu>
            </Layout.Sider>

            <Layout>
              <Layout.Content style={{ padding: "16px" }}>
              <Refine
            routerProvider={routerProvider}
            resources={[]}
            options={{}}
          >
            {/* 사용자 정의 레이아웃을 Refine의 children으로 배치 */}
            <CustomLayout>
              <AppRoutes />
              <Chatbot />
              <Drawer
                title="Notifications"
                placement="right"
                closable
                onClose={toggleDrawer}
                open={isDrawerOpen}
                width={400}
              >
                <NotificationComponent
                  onOpen={toggleDrawer}
                  isOpen={isDrawerOpen}
                />
              </Drawer>
            </CustomLayout>
          </Refine>

                <Chatbot />

                <Drawer
                  title="Notifications"
                  placement="right"
                  closable
                  onClose={toggleDrawer}
                  open={isDrawerOpen}
                  width={400}
                >
                  <NotificationComponent
                    onOpen={toggleDrawer}
                    isOpen={isDrawerOpen}
                  />
                </Drawer>
              </Layout.Content>
            </Layout>
          </Layout>
        </ConfigProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
