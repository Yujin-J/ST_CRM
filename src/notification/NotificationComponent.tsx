import React from "react";
import { Button, Drawer } from "antd";
import { NotificationDrawer } from "./NotificationDrawer"; // 구현한 NotificationDrawer를 가져옵니다.

const NotificationComponent: React.FC<{
  onOpen: () => void;
  isOpen: boolean;
}> = ({ onOpen, isOpen }) => {
  return (
    <>
      <NotificationDrawer />
    </>
  );
};

export default NotificationComponent;
