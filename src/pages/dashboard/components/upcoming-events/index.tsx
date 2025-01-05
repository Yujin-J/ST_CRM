import { CalendarOutlined } from "@ant-design/icons";
import { Badge, Card, List } from "antd";
import dayjs from "dayjs";
import { Text } from "../../../../components/text";

const fakeEvents = [
  {
    id: 1,
    title: "Team Meeting",
    startDate: dayjs().add(1, "day").toISOString(),
    endDate: dayjs().add(1, "day").add(2, "hours").toISOString(),
    color: "#1890ff",
  },
  {
    id: 2,
    title: "Client Presentation",
    startDate: dayjs().add(2, "days").toISOString(),
    endDate: dayjs().add(2, "days").add(1, "hour").toISOString(),
    color: "#52c41a",
  },
  {
    id: 3,
    title: "Product Launch",
    startDate: dayjs().add(3, "days").toISOString(),
    endDate: dayjs().add(3, "days").add(4, "hours").toISOString(),
    color: "#f5222d",
  },
];

export const CalendarUpcomingEvents = () => {
  return (
    <Card
      style={{
        height: "100%",
      }}
      headStyle={{ padding: "8px 16px" }}
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
          <CalendarOutlined />
          <Text size="sm" style={{ marginLeft: ".7rem" }}>
            Upcoming events
          </Text>
        </div>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={fakeEvents}
        renderItem={(item) => {
          const renderDate = () => {
            const start = dayjs(item.startDate).format("MMM DD, YYYY - HH:mm");
            const end = dayjs(item.endDate).format("MMM DD, YYYY - HH:mm");
            return `${start} - ${end}`;
          };

          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Badge color={item.color} />}
                title={<Text size="xs">{renderDate()}</Text>}
                description={
                  <Text ellipsis={{ tooltip: true }} strong>
                    {item.title}
                  </Text>
                }
              />
            </List.Item>
          );
        }}
      />

      {fakeEvents.length === 0 && <NoEvent />}
    </Card>
  );
};

const NoEvent = () => (
  <span
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "220px",
    }}
  >
    No Upcoming Event
  </span>
);
