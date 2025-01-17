import React, { useState, useEffect } from "react";
import { List, Typography, Badge } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase_base } from "../helpers/firebase/firebaseConfig";

const { Text } = Typography;

export const NotificationDrawer: React.FC = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        }));
        setNotifications(notificationsData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching notifications</p>;
  return (
    <List
      dataSource={notifications}
      renderItem={(notification) => (
        <List.Item>
          <List.Item.Meta
            title={
              <Badge dot={!notification.read}>
                <Text strong>{notification.title}</Text>
              </Badge>
            }
            description={notification.body}
          />
          <Text type="secondary">
            {notification?.time
              ? new Date(notification?.time).toLocaleString()
              : ""}
          </Text>
        </List.Item>
      )}
    />
  );
};
