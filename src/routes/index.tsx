// index.tsx
import { Authenticated } from "@refinedev/core";
import {
  ThemedLayoutV2,
  ErrorComponent,
  AuthPage,
  ThemedTitleV2,
  ThemedSiderV2,
} from "@refinedev/antd";
import {
  GoogleOutlined,
  GithubOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { NavigateToResource, CatchAllNavigate } from "@refinedev/react-router";
import { Routes, Route, Outlet } from "react-router";
import { Menu, Badge } from "antd";

import { PostList, PostEdit, PostShow } from "../pages/posts";
import { DashboardPage } from "../pages/dashboard";
import {
  CustomerCreatePage,
  CustomerEditPage,
  CustomerListPage,
} from "../pages/customers";

import {
  ContactCreatePage,
  ContactEditPage,
  ContactListPage,
} from "../pages/contacts";

import {
  InteractionCreatePage,
  InteractionEditPage,
  InteractionListPage,
} from "../pages/interaction";

import { InteractionTable } from "../pages/ProcessInteraction";

interface AppRoutesProps {
  toggleDrawer: () => void;
  unreadCount: number; // 추가
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  toggleDrawer,
  unreadCount,
}) => {
  return (
    <Routes>
      <Route
        element={
          <Authenticated
            key="authenticated-routes"
            fallback={<CatchAllNavigate to="/login" />}
          >
            <ThemedLayoutV2
              Sider={() => (
                <ThemedSiderV2
                  Title={({ collapsed }) => (
                    <ThemedTitleV2 collapsed={collapsed} text="CRM" />
                  )}
                  render={({ items, logout, collapsed }) => {
                    return (
                      <>
                        {items}
                        {/* unreadCount가 1 이상이면 dot 표시 */}
                        <Menu.Item
                          key="notifications"
                          icon={
                            <Badge dot={unreadCount > 0} offset={[-20, 0]}>
                              <BellOutlined />
                            </Badge>
                          }
                          onClick={toggleDrawer}
                        >
                          Notifications
                        </Menu.Item>
                        {logout}
                      </>
                    );
                  }}
                />
              )}
            >
              <Outlet />
            </ThemedLayoutV2>
          </Authenticated>
        }
      >
        <Route index element={<DashboardPage />} />

        <Route path="/posts">
          <Route index element={<PostList />} />
          <Route path="edit/:id" element={<PostEdit />} />
          <Route path="show/:id" element={<PostShow />} />
        </Route>

        <Route path="/customers">
          <Route index element={<CustomerListPage />} />
          <Route path="new" element={<CustomerCreatePage />} />
          <Route path="edit/:id" element={<CustomerEditPage />} />
        </Route>

        <Route path="/contacts">
          <Route index element={<ContactListPage />} />
          <Route path="new" element={<ContactCreatePage />} />
          <Route path="edit/:id" element={<ContactEditPage />} />
        </Route>

        <Route path="/interaction">
          <Route index element={<InteractionListPage />} />
          <Route path="new" element={<InteractionCreatePage />} />
          <Route path="edit/:id" element={<InteractionEditPage />} />
        </Route>

        <Route path="/process-interaction" element={<InteractionTable />} />
      </Route>

      <Route
        element={
          <Authenticated key="auth-pages" fallback={<Outlet />}>
            <NavigateToResource resource="customers" />
          </Authenticated>
        }
      >
        <Route path="/login" element={<AuthPage type="login" />} />
        <Route
          path="/register"
          element={
            <AuthPage
              type="register"
              providers={[
                {
                  name: "google",
                  label: "Sign in with Google",
                  icon: (
                    <GoogleOutlined
                      style={{
                        fontSize: 24,
                        lineHeight: 0,
                      }}
                    />
                  ),
                },
                {
                  name: "github",
                  label: "Sign in with GitHub",
                  icon: (
                    <GithubOutlined
                      style={{
                        fontSize: 24,
                        lineHeight: 0,
                      }}
                    />
                  ),
                },
              ]}
            />
          }
        />
        <Route
          path="/forgot-password"
          element={<AuthPage type="forgotPassword" />}
        />
        <Route
          path="/update-password"
          element={<AuthPage type="updatePassword" />}
        />
      </Route>

      <Route
        element={
          <Authenticated key="catch-all">
            <ThemedLayoutV2>
              <Outlet />
            </ThemedLayoutV2>
          </Authenticated>
        }
      >
        <Route path="*" element={<ErrorComponent />} />
      </Route>
    </Routes>
  );
};
