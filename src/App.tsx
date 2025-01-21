// App.tsx
import React, { useState, useEffect } from "react";
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
import { BrowserRouter } from "react-router-dom";
import { App as AntdApp, ConfigProvider, Drawer } from "antd";

// Firestore 관련 import
import {
  firebaseAuth,
  firestoreDataProvider,
  firestoreDatabase_base,
} from "./helpers/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import "@refinedev/antd/dist/reset.css";
import { AppRoutes } from "./routes";
import Chatbot from "./chatbot/Chatbot";
import NotificationComponent from "./notification/NotificationComponent";

const App: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [lastReadTime, setLastReadTime] = useState<string | null>(null);

  // (1) 앱 로딩 시점에 localStorage에서 lastReadTime 불러오기
  useEffect(() => {
    const storedLastReadTime = localStorage.getItem("lastReadTime");
    if (storedLastReadTime) {
      setLastReadTime(storedLastReadTime);
    }
  }, []);

  // (2) Firestore 상의 알림 데이터를 불러와서, localStorage의 lastReadTime과 비교
  useEffect(() => {
    // lastReadTime이 세팅된 후(또는 null일 수도 있음)에 실행
    const fetchUnreadNotifications = async () => {
      try {
        // notifications 컬렉션에서 모든 문서 가져오기
        const snapshot = await getDocs(collection(firestoreDatabase_base, "notifications"));
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<{ time: string }>;

        // 시간 순 정렬(옵션 - 필요 시)
        notificationsData.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        // 만약 lastReadTime이 없으면 => 한 번도 알림 창을 닫은 적이 없으므로, 모두 "안 읽은 알림"
        if (!lastReadTime) {
          setUnreadCount(notificationsData.length);
        } else {
          // lastReadTime 이후(time이 더 큰) 알림만 "안 읽은 알림"으로 간주
          const count = notificationsData.filter(
            (n) => new Date(n.time).getTime() > new Date(lastReadTime).getTime()
          ).length;
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // lastReadTime을 불러온 뒤에 실행
    fetchUnreadNotifications();
  }, [lastReadTime]);

  // (3) Drawer 열고 닫는 함수
  // -> "닫힐 때" 읽음 처리 로직을 수행
  const toggleDrawer = () => {
    // 이미 열려 있다면 => 지금 닫히려는 시점
    if (isDrawerOpen) {
      // 읽음 처리 (lastReadTime 업데이트 + unreadCount 0)
      const currentTime = new Date().toISOString();
      setLastReadTime(currentTime);
      localStorage.setItem("lastReadTime", currentTime);
      setUnreadCount(0);
    }
    // 열림/닫힘
    setIsDrawerOpen((prev) => !prev);
  };

  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          {/* (A) 항상 렌더링되는 Chatbot */}
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
                list: "/interaction",
                show: "/interaction/:id",
                create: "/interaction/new",
                edit: "/interaction/edit/:id",
                meta: {
                  label: "Interactions",
                  icon: <CommentOutlined />,
                },
              },
            ]}
          >
            {/* 
              (B) AppRoutes에 toggleDrawer, unreadCount 전달
            */}
            <AppRoutes toggleDrawer={toggleDrawer} unreadCount={unreadCount} />

            <Drawer
              title="Notifications"
              placement="right"
              closable
              onClose={toggleDrawer}
              open={isDrawerOpen}
              width={400}
            >
              {/* 
                (C) NotificationComponent는 
                lastReadTime, setUnreadCount를 통해
                상세 알림 목록 표시 & 내부에서도 unreadCount를 업데이트할 수 있음
              */}
              <NotificationComponent
                lastReadTime={lastReadTime}
                setUnreadCount={setUnreadCount}
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
