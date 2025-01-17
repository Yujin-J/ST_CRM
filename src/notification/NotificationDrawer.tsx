import React from "react";
import { List, Typography, Badge } from "antd";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase_base } from "../helpers/firebase/firebaseConfig";

const { Text } = Typography;

export const NotificationDrawer: React.FC = () => {
  const fetchNotifications = async () => {
    const snapshot = await getDocs(collection(firestoreDatabase_base, "notifications"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching notifications</p>;

  const notifications = data || [];

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
            {notification.timestamp?.seconds
              ? new Date(notification.timestamp.seconds * 1000).toLocaleString()
              : "Unknown Date"}
          </Text>
        </List.Item>
      )}
    />
  );
};
