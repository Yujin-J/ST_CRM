import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button, Card, Space, Table } from "antd";
import { Text } from "../../../components/text";

export const InteractionTable = () => {
  const [dateFilter, setDateFilter] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("");

  // Fetch interaction data from Firebase
  const { data, isLoading } = useList({
    resource: "interaction", // Firestore interaction 컬렉션에서 데이터 가져오기
  });

  // 데이터가 없으면 빈 배열을 반환
  const interactions = data?.data || [];

  // 필터링 로직
  const filteredInteractions = useMemo(() => {
    return interactions.filter(
      (interaction) =>
        interaction.date.toLowerCase().includes(dateFilter.toLowerCase()) &&
        interaction.emotion.toLowerCase().includes(emotionFilter.toLowerCase())
    );
  }, [interactions, dateFilter, emotionFilter]);

  return (
    <Card
      title="Interactions"
      headStyle={{ borderBottom: "1px solid #D9D9D9", marginBottom: "1px" }}
      bodyStyle={{ padding: 0 }}
      extra={
        <>
          <Text className="tertiary">Total interactions: </Text>
          <Text strong>{filteredInteractions.length}</Text>
        </>
      }
    >
      <Table
        dataSource={filteredInteractions}
        rowKey="id"
        loading={isLoading}
        pagination={{ showSizeChanger: false }}
      >
        <Table.Column
          title="Date"
          dataIndex="date"
          render={(date) => <Text>{date}</Text>}
          filterDropdown={(props) => (
            <input
              placeholder="Search Date"
              onChange={(e) => setDateFilter(e.target.value)}
            />
          )}
        />
        <Table.Column
          title="Emotion"
          dataIndex="emotion"
          render={(emotion) => <Text>{emotion}</Text>}
          filterDropdown={(props) => (
            <input
              placeholder="Search Emotion"
              onChange={(e) => setEmotionFilter(e.target.value)}
            />
          )}
        />
        <Table.Column
          title="Notes"
          dataIndex="notes"
          render={(notes) => <Text>{notes}</Text>}
        />
        <Table.Column
          title="Sentiment Score"
          dataIndex="sentiment_score"
          render={(score) => <Text>{score}</Text>}
        />
        <Table.Column
          title="Actions"
          dataIndex="id"
          render={(id) => (
            <Space>
              <Button>Edit</Button>
              <Button danger>Delete</Button>
            </Space>
          )}
        />
      </Table>
    </Card>
  );
};
