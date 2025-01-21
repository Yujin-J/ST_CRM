// src/components/NotificationIcon.tsx
import React from "react";
import { Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";

interface NotificationIconProps {
  hasUnread: boolean;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ hasUnread }) => {
  return (
    <Badge
      dot={hasUnread}
      color="red"
      offset={[-5, 5]} // 도트의 위치를 조정 (필요에 따라 수정)
    >
      <BellOutlined style={{ fontSize: '20px', color: '#fff' }} />
    </Badge>
  );
};

export default NotificationIcon;
