import { Space, Tag } from "antd";

import { CustomAvatar } from "../custom-avatar";

// Define base types that might be needed from GraphQL schema
type Maybe<T> = T | null;
type ID = string;

// Define the User type with required fields from GraphQL and optional complex fields
type User = {
  id: ID;
  name: string;
  avatarUrl?: Maybe<string>;
  email: string;
  // Optional fields from GraphQL schema
  jobTitle?: Maybe<string>;
  phone?: Maybe<string>;
  role?: string;
  timezone?: Maybe<string>;
  // Complex fields made optional
  companies?: any;
  contacts?: any;
  deals?: any;
  events?: any;
  tasks?: any;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: Maybe<User>;
  updatedBy?: Maybe<User>;
};

type Props = {
  user: User;
};

export const UserTag = ({ user }: Props) => {
  return (
    <Tag
      key={user.id}
      style={{
        padding: 2,
        paddingRight: 8,
        borderRadius: 24,
        lineHeight: "unset",
        marginRight: "unset",
      }}
    >
      <Space size={4}>
        <CustomAvatar
          src={user.avatarUrl}
          name={user.name}
          style={{ display: "inline-flex" }}
        />
        {user.name}
      </Space>
    </Tag>
  );
};
