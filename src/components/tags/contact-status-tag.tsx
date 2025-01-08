import React from "react";

import {
  CheckCircleOutlined,
  MinusCircleOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Tag, type TagProps } from "antd";

/** Contact status */
export type ContactStatus =
  | "CHURNED"
  | "CONTACTED"
  | "INTERESTED"
  | "LOST"
  | "NEGOTIATION"
  | "NEW"
  | "QUALIFIED"
  | "UNQUALIFIED"
  | "WON";

type Props = {
  status?: ContactStatus; // status가 선택적일 수 있도록 변경
};

export const ContactStatusTag = ({ status }: Props) => {
  if (!status) {
    // status가 undefined일 경우 기본 처리
    return (
      <Tag color="default" style={{ textTransform: "capitalize" }}>
        <MinusCircleOutlined /> Unknown
      </Tag>
    );
  }

  let icon: React.ReactNode = null;
  let color: TagProps["color"] = undefined;

  switch (status) {
    case "NEW":
    case "CONTACTED":
    case "INTERESTED":
      icon = <PlayCircleOutlined />;
      color = "cyan";
      break;
    case "UNQUALIFIED":
      icon = <PlayCircleOutlined />;
      color = "red";
      break;
    case "QUALIFIED":
    case "NEGOTIATION":
      icon = <PlayCircleFilled />;
      color = "green";
      break;
    case "LOST":
      icon = <PlayCircleFilled />;
      color = "red";
      break;
    case "WON":
      icon = <CheckCircleOutlined />;
      color = "green";
      break;
    case "CHURNED":
      icon = <MinusCircleOutlined />;
      color = "red";
      break;

    default:
      break;
  }

  return (
    <Tag color={color} style={{ textTransform: "capitalize" }}>
      {icon} {status.toLowerCase()}
    </Tag>
  );
};