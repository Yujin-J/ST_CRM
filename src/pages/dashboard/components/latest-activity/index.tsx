import { UnorderedListOutlined } from "@ant-design/icons";
import { Card, List, Space } from "antd";
import dayjs from "dayjs";
import { Text } from "../../../../components/text";
import { CustomAvatar } from "../../../../components/custom-avatar";

const fakeActivities = [
  {
    id: "1",
    action: "CREATE",
    user: { name: "John Doe" },
    targetId: "deal1",
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    action: "UPDATE",
    user: { name: "Jane Smith" },
    targetId: "deal2",
    createdAt: "2024-03-14T15:30:00Z",
  },
  {
    id: "3",
    action: "CREATE",
    user: { name: "Mike Johnson" },
    targetId: "deal3",
    createdAt: "2024-03-13T09:15:00Z",
  },
];

const fakeDeals = [
  {
    id: "deal1",
    title: "Enterprise Software Deal",
    company: {
      name: "Tech Corp",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
    },
    stage: { title: "Qualified" },
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "deal2",
    title: "Cloud Services Package",
    company: {
      name: "Cloud Systems",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
    },
    stage: { title: "Negotiation" },
    createdAt: "2024-03-14T15:30:00Z",
  },
  {
    id: "deal3",
    title: "Training Program",
    company: {
      name: "Education Plus",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=EP",
    },
    stage: { title: "Discovery" },
    createdAt: "2024-03-13T09:15:00Z",
  },
];

type Props = { limit?: number };

export const DashboardLatestActivities = ({ limit = 5 }: Props) => {
  return (
    <Card
      headStyle={{ padding: "16px" }}
      bodyStyle={{
        padding: "0 1rem",
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <UnorderedListOutlined />
          <Text size="sm" style={{ marginLeft: ".5rem" }}>
            Latest activities
          </Text>
        </div>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={fakeActivities.slice(0, limit)}
        renderItem={(item) => {
          const deal = fakeDeals.find((deal) => deal.id === item.targetId);

          return (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <CustomAvatar
                    shape="square"
                    size={48}
                    src={deal?.company.avatarUrl}
                    name={deal?.company.name}
                  />
                }
                title={dayjs(deal?.createdAt).format("MMM DD, YYYY - HH:mm")}
                description={
                  <Space size={4}>
                    <Text strong>{item.user?.name}</Text>
                    <Text>
                      {item.action === "CREATE" ? "created" : "moved"}
                    </Text>
                    <Text strong>{deal?.title}</Text>
                    <Text>deal</Text>
                    <Text>{item.action === "CREATE" ? "in" : "to"}</Text>
                    <Text strong>{deal?.stage?.title || "Unassigned"}.</Text>
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};
