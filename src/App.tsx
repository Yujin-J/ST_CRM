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
import { BrowserRouter } from "react-router-dom";

import {
  Layout,
  ConfigProvider,
  Drawer,
  Menu,
  Button,
  message,
} from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import {
  firebaseAuth,
  firestoreDataProvider,
} from "./helpers/firebase/firebaseConfig";
import "@refinedev/antd/dist/reset.css";
import NotificationComponent from "./notification/NotificationComponent";
import Chatbot from "./chatbot/Chatbot";
import { AppRoutes } from "./routes";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut(); // Firebase 로그아웃 수행
      message.success("Successfully logged out!");
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
            {/* 왼쪽 메뉴 */}
            <Layout.Sider theme="light">
              <Menu
                mode="inline"
                defaultSelectedKeys={["dashboard"]}
                style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                    Dashboard
                  </Menu.Item>
                  <Menu.Item key="customers" icon={<ShopOutlined />}>
                    Customers
                  </Menu.Item>
                  <Menu.Item key="contacts" icon={<ContactsOutlined />}>
                    Contacts
                  </Menu.Item>
                  <Menu.Item key="interaction" icon={<CommentOutlined />}>
                    Interaction
                  </Menu.Item>
                  <Menu.Item
                    key="notifications"
                    icon={<BellOutlined />}
                    onClick={toggleDrawer} // 클릭 시 Drawer 열림
                  >
                    Notifications
                  </Menu.Item>
                  <Menu.Item
                    key="logout"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout} // 로그아웃 핸들러 연결
                  >
                    Logout
                  </Menu.Item>
                </div>
              </Menu>
            </Layout.Sider>

            {/* 콘텐츠 영역 */}
            <Layout>
              <Layout.Content style={{ padding: "16px" }}>
                <Refine
                  legacyAuthProvider={firebaseAuth.getAuthProvider()}
                  dataProvider={firestoreDataProvider.getDataProvider()}
                  routerProvider={routerProvider}
                  resources={[
                    {
                      name: "dashboard",
                      list: "/",
                      meta: {
                        label: "Dashboard",
                        icon: <DashboardOutlined />,
                      },
                    },
                    {
                      name: "customers",
                      list: "/customers",
                      show: "/customers/:id",
                      create: "/customers/new",
                      edit: "/customers/edit/:id",
                      meta: {
                        label: "Customers",
                        icon: <ShopOutlined />,
                      },
                    },
                    {
                      name: "contacts",
                      list: "/contacts",
                      show: "/contacts/:id",
                      create: "/contacts/new",
                      edit: "/contacts/edit/:id",
                      meta: {
                        label: "Contacts",
                        icon: <ContactsOutlined />,
                      },
                    },
                    {
                      name: "interaction",
                      list: "/interaction",
                      show: "/interaction/:id",
                      create: "/interaction/new",
                      edit: "/interaction/edit/:id",
                      meta: {
                        label: "Interaction",
                        icon: <CommentOutlined />,
                      },
                    },
                  ]}
                >
                  <AppRoutes />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>

                {/* 항상 렌더링되는 Chatbot 컴포넌트 */}
                <Chatbot />

                {/* Drawer 내부에 NotificationComponent 렌더링 */}
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
