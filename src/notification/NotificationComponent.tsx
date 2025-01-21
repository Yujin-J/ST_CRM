// NotificationComponent.tsx
import React, { useState, useEffect } from "react";
import { List, Typography, Badge, Select, Spin, Alert } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase_base } from "../helpers/firebase/firebaseConfig";
import { MinusOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

interface Notification {
  id: string;
  title: string;
  body: string;
  priority: string;
  time: string;
  read?: boolean;
}

interface NotificationComponentProps {
  lastReadTime: string | null;
  setUnreadCount: (count: number) => void;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({
  lastReadTime,
  setUnreadCount,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  const priorities = ["very high", "high", "medium", "low", "very low"];

  const priorityValues: { [key: string]: number } = {
    "very high": 5,
    high: 4,
    medium: 3,
    low: 2,
    "very low": 1,
  };

  // 1) 알림 목록 불러오기
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const snapshot = await getDocs(
          collection(firestoreDatabase_base, "notifications")
        );
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];

        // 시간 내림차순 정렬
        notificationsData.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        setNotifications(notificationsData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // 2) lastReadTime 기준으로 "안 읽은 알림 개수" 세팅
  useEffect(() => {
    if (lastReadTime) {
      // 읽은 시각(lastReadTime) 이후에 생성된 알림 = 아직 안 읽음
      const count = notifications.filter(
        (notification) => new Date(notification.time) > new Date(lastReadTime)
      ).length;
      setUnreadCount(count);
    } else {
      // lastReadTime이 null이면 => 한 번도 읽음 처리 안 함
      // => 모든 알림을 "안 읽은 알림"으로 간주
      setUnreadCount(notifications.length);
    }
  }, [notifications, lastReadTime, setUnreadCount]);

  // 3) 우선순위 필터링
  const filteredNotifications = filterPriority
    ? notifications.filter(
        (notification) =>
          priorityValues[notification.priority.toLowerCase()] >=
          priorityValues[filterPriority.toLowerCase()]
      )
    : notifications;

  if (isLoading) {
    return <Spin tip="Loading notifications..." />;
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="Error fetching notifications."
        type="error"
        showIcon
      />
    );
  }

  // 우선순위별 아이콘/컬러 매핑
  const priorityMapping: {
    [key: string]: { color: string; icons: JSX.Element[] };
  } = {
    "very high": {
      color: "red",
      icons: [
        <img
          src="/double-arrow-up.png"
          alt="Very High Priority"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="vh"
        />,
      ],
    },
    high: {
      color: "orange",
      icons: [
        <img
          src="/single-arrow-up.png"
          alt="High Priority"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="h"
        />,
      ],
    },
    medium: {
      color: "black",
      icons: [
        <img
          src="/normal.png"
          alt="Medium Priority"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="m"
        />,
      ],
    },
    low: {
      color: "green",
      icons: [
        <img
          src="/single-arrow-down.png"
          alt="Low Priority"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="l"
        />,
      ],
    },
    "very low": {
      color: "blue",
      icons: [
        <img
          src="/double-arrow-down.png"
          alt="Very Low Priority"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="vl"
        />,
      ],
    },
  };

  // 렌더
  return (
    <div>
      {/* 우선순위 필터 Select */}
      <Select
        placeholder="Filter by Priority"
        style={{ width: 250, marginBottom: 16 }}
        allowClear
        onChange={(value) => setFilterPriority(value)}
        value={filterPriority}
      >
        {priorities.map((priority) => {
          if (priority === "very low") {
            return (
              <Option key={priority} value={priority}>
                All
              </Option>
            );
          } else if (priority === "very high") {
            return (
              <Option key={priority} value={priority}>
                {capitalize(priority)}
              </Option>
            );
          }
          return (
            <Option key={priority} value={priority}>
              {capitalize(priority)} or higher
            </Option>
          );
        })}
      </Select>

      {/* 알림 리스트 */}
      <List
        dataSource={filteredNotifications}
        renderItem={(notification) => {
          const { priority } = notification;
          const mapping =
            priorityMapping[priority.toLowerCase()] || {
              color: "black",
              icons: [<MinusOutlined key="icon" />],
            };

          // lastReadTime 이전(과거) 알림 => 이미 읽은 것
          // lastReadTime 이후(미래) 알림 => 안 읽은 것
          const isUnread =
            !lastReadTime ||
            new Date(notification.time) > new Date(lastReadTime);

          return (
            <List.Item>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {/* 레드닷: offset 사용해서 위치 왼쪽으로 살짝 이동 */}
                      <Badge
                        dot={isUnread}
                        offset={[-20, -5]}
                        style={{ marginRight: 8 }}
                      >
                        <span>{mapping.icons}</span>
                      </Badge>
                      <Text strong style={{ color: mapping.color }}>
                        {notification.title}
                      </Text>
                    </div>
                  }
                  description={notification.body}
                />
                <div style={{ textAlign: "right", marginTop: 8 }}>
                  <Text type="secondary">
                    {notification?.time
                      ? new Date(notification?.time).toLocaleString()
                      : ""}
                  </Text>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default NotificationComponent;
