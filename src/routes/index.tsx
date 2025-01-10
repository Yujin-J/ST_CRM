import { Authenticated, useNavigation, AuthProvider } from "@refinedev/core";
import {
  ThemedLayoutV2,
  ErrorComponent,
  AuthPage,
  Header,
  PageHeader,
  ThemedTitleV2,
} from "@refinedev/antd";
import { GoogleOutlined, GithubOutlined } from "@ant-design/icons";
import { NavigateToResource, CatchAllNavigate } from "@refinedev/react-router";
import { Routes, Route, Outlet, Link } from "react-router";

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

// ProcessEnquiry 컴포넌트 import
import ProcessEnquiry from "../pages/ProcessEnquiry";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <Authenticated
            key="authenticated-routes"
            fallback={<CatchAllNavigate to="/login" />}
          >
            <ThemedLayoutV2
              Title={({ collapsed }) => (
                <ThemedTitleV2
                  collapsed={collapsed}
                  text="CRM"
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

        {/* Contacts 라우트 추가 */}
        <Route path="/contacts">
          <Route index element={<ContactListPage />} />
          <Route path="new" element={<ContactCreatePage />} />
          <Route path="edit/:id" element={<ContactEditPage />} />
        </Route>

        {/* ProcessEnquiry 라우트 추가 */}
        <Route path="/process-enquiry" element={<ProcessEnquiry />} />
      </Route>

      <Route
        element={
          <Authenticated key="auth-pages" fallback={<Outlet />}>
            <NavigateToResource resource="customers" />
          </Authenticated>
        }
      >
        <Route
          path="/login"
          element={
            <AuthPage
              type="login"
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
              ]}
            />
          }
        />
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