import { Refine } from "@refinedev/core";
import { RefineThemes } from "@refinedev/antd";
import {
  DashboardOutlined,
  ShopOutlined,
  ContactsOutlined,
  CommentOutlined,
} from "@ant-design/icons";

import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter } from "react-router";
import { App as AntdApp, ConfigProvider, Drawer } from "antd";

import {
  firebaseAuth,
  firestoreDataProvider,
} from "./helpers/firebase/firebaseConfig";

import "@refinedev/antd/dist/reset.css";
import { AppRoutes } from "./routes";
import Chatbot from "./chatbot/Chatbot"; // Chatbot 컴포넌트 import
import { useState } from "react";
import NotificationComponent from "./notification/NotificationComponent";

const App: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          {/* 항상 렌더링되는 Chatbot 컴포넌트 */}
          <Chatbot />
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
                list: "/interaction", // 기본 경로를 설정하면 Refine의 기본 테이블 UI가 사용됩니다.
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
            <AppRoutes toggleDrawer={toggleDrawer} />
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
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
