import { Refine } from "@refinedev/core";
import { RefineThemes } from "@refinedev/antd";
import { DashboardOutlined, ShopOutlined } from "@ant-design/icons";

import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter } from "react-router";
import { App as AntdApp, ConfigProvider } from "antd";

import {
  firebaseAuth,
  firestoreDatabase,
} from "./helpers/firebase/firebaseConfig";

import "@refinedev/antd/dist/reset.css";
import { AppRoutes } from "./routes";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            legacyAuthProvider={firebaseAuth.getAuthProvider()}
            dataProvider={firestoreDatabase.getDataProvider()}
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
              },
            ]}
          >
            <AppRoutes />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
