import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button, Card, Space, Table } from "antd";
import { Text } from "../../../components/text";
import { useParams } from "react-router";

export const InteractionTable = () => {
  const params = useParams();
  const [dateFilter, setDateFilter] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("");

  // Fetch interaction data from Firebase
  const { data, isLoading } = useList({
    resource: "interaction", // Firestore interaction 컬렉션에서 데이터 가져오기
    filters: [{
      field: "contact_id",
      operator: "eq",
      value: params?.id,
    },]
  });

  console.log(data);

  // 데이터가 없으면 빈 배열을 반환
  const interactions = (data?.data || []).map((interaction) => ({
    ...interaction,
    Classification: interaction.classification?.Classfication || "N/A",
    Sentiment_score: interaction.classification?.Sentiment_score ?? "N/A",
  }));

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
          dataIndex="Classification"
          render={(Classification) => <Text>{Classification}</Text>}
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
          dataIndex="Sentiment_score"
          render={(Sentiment_score) => <Text>{Sentiment_score}</Text>}
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
