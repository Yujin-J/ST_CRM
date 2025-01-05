import { DollarOutlined } from "@ant-design/icons";
import { Area, type AreaConfig } from "@ant-design/plots";
import { Card } from "antd";
import { Text } from "../../../../components/text";

const fakeDealsData = [
  { timeText: "Jan", value: 45000, state: "Won" },
  { timeText: "Feb", value: 52000, state: "Won" },
  { timeText: "Mar", value: 61000, state: "Won" },
  { timeText: "Apr", value: 55000, state: "Won" },
  { timeText: "May", value: 48000, state: "Won" },
  { timeText: "Jun", value: 58000, state: "Won" },
  { timeText: "Jan", value: 25000, state: "Lost" },
  { timeText: "Feb", value: 28000, state: "Lost" },
  { timeText: "Mar", value: 33000, state: "Lost" },
  { timeText: "Apr", value: 35000, state: "Lost" },
  { timeText: "May", value: 22000, state: "Lost" },
  { timeText: "Jun", value: 27000, state: "Lost" },
];

export const DashboardDealsChart = () => {
  const config: AreaConfig = {
    isStack: false,
    data: fakeDealsData,
    xField: "timeText",
    yField: "value",
    seriesField: "state",
    animation: true,
    startOnZero: false,
    smooth: true,
    legend: {
      offsetY: -6,
    },
    yAxis: {
      tickCount: 4,
      label: {
        formatter: (v) => {
          return `$${Number(v) / 1000}k`;
        },
      },
    },
    tooltip: {
      formatter: (data) => {
        return {
          name: data.state,
          value: `$${Number(data.value) / 1000}k`,
        };
      },
    },
    areaStyle: (datum) => {
      const won = "l(270) 0:#ffffff 0.5:#b7eb8f 1:#52c41a";
      const lost = "l(270) 0:#ffffff 0.5:#f3b7c2 1:#ff4d4f";
      return { fill: datum.state === "Won" ? won : lost };
    },
    color: (datum) => {
      return datum.state === "Won" ? "#52C41A" : "#F5222D";
    },
  };

  return (
    <Card
      style={{ height: "100%" }}
      headStyle={{ padding: "8px 16px" }}
      bodyStyle={{ padding: "24px 24px 0px 24px" }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <DollarOutlined />
          <Text size="sm" style={{ marginLeft: ".5rem" }}>
            Deals
          </Text>
        </div>
      }
    >
      <Area {...config} height={325} />
    </Card>
  );
};
