import React, { useState, useEffect } from "react";
import { List, Typography, Badge, Select } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase_base } from "../helpers/firebase/firebaseConfig";
import { MinusOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

// 1. Notification 인터페이스 정의
interface Notification {
  id: string;
  title: string;
  body: string;
  priority: string;
  time: string;
  read?: boolean;
}

export const NotificationDrawer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  // Priority levels in order of importance
  const priorities = ["very high", "high", "medium", "low", "very low"];

  // Assign numeric values for priority comparison
  const priorityValues: { [key: string]: number } = {
    "very high": 5,
    high: 4,
    medium: 3,
    low: 2,
    "very low": 1,
  };

  // 2. Firestore에서 공지 불러오기
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

        // Sort by time descending
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

  // 3. 우선도별 색상 및 아이콘 매핑
  const priorityMapping: {
    [key: string]: { color: string; icons: JSX.Element[] };
  } = {
    "very high": {
      color: "red",
      icons: [
        <img
          src="/double-arrow-up.png" // public 폴더에 저장된 이미지 경로
          alt="Very High Priority"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="image"
        />,
      ],
    },
    high: {
      color: "orange",
      icons: [
        <img
          src="/single-arrow-up.png" // public 폴더에 저장된 이미지 경로
          alt="High Priority"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="image"
        />,
      ],
    },
    medium: {
      color: "black", // medium 우선도는 까만색
      icons: [
        <img
          src="/normal.png" // public 폴더에 저장된 이미지 경로
          alt="medium"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="image"
        />,
      ],
    },
    low: {
      color: "green",
      icons: [
        <img
          src="/single-arrow-down.png" // public 폴더에 저장된 이미지 경로
          alt="Low Priority"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="image"
        />,
      ],
    },
    "very low": {
      color: "blue",
      icons: [
        <img
          src="/double-arrow-down.png" // public 폴더에 저장된 이미지 경로
          alt="Very Low Priority"
          style={{ width: 16, height: 16, marginRight: 8 }}
          key="image"
        />,
      ],
    },
  };

  // 4. 로딩 및 에러 처리
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching notifications</p>;

  // 5. 필터링된 공지 데이터
  const filteredNotifications = filterPriority
    ? notifications.filter(
        (notification) =>
          priorityValues[notification.priority.toLowerCase()] >=
          priorityValues[filterPriority.toLowerCase()]
      )
    : notifications;

  // 6. 공지 리스트 렌더링
  return (
    <div>
      {/* 6.1 필터링 버튼 추가 */}
      <Select
        placeholder="Filter by Priority"
        style={{ width: 250, marginBottom: 16 }}
        allowClear
        onChange={(value) => setFilterPriority(value)}
      >
        {priorities.map((priority) => {
          if (priority === "very low") {
            return (
              <Option key={priority} value={priority}>
                All
              </Option>
            );
          }
          else if (priority === "very high") {
            return (
              <Option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Option>
            )
          }
          return (
            <Option key={priority} value={priority}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} or higher
            </Option>
          );
        })}
      </Select>

      <List
        dataSource={filteredNotifications}
        renderItem={(notification) => {
          const { priority } = notification;
          // 우선도를 소문자로 변환하여 매핑
          const mapping = priorityMapping[priority.toLowerCase()] || {
            color: "black", // medium과 undefined를 포함하여 까만색으로 설정
            icons: [<MinusOutlined key="1" />],
          };

          return (
            <List.Item>
              <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                {/* 제목과 내용 */}
                <List.Item.Meta
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {/* 우선도 아이콘과 Badge */}
                      <Badge
                        dot={!notification.read}
                        offset={[-20, -5]}
                        style={{ marginRight: 8 }}
                      >
                        <span>{mapping.icons}</span>
                      </Badge>
                      {/* 우선도에 따른 색상으로 제목 표시 */}
                      <Text strong style={{ color: mapping.color }}>
                        {notification.title}
                      </Text>
                    </div>
                  }
                  description={notification.body}
                />
                {/* 시간 표시를 독립적으로 배치 */}
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
