import React, { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button, Card, Space, Table, Input } from "antd";
import { Text } from "../components/text/index";
import { useParams } from "react-router";
import { callAIStudio } from "../helpers/api/aiStudioApi";
import { updateDbWithChatbot } from "../helpers/firebase/firestoreHelpers";

// 데이터 타입 정의
interface Interaction {
  id: string;
  date: string;
  notes: string;
  Classification: string;
  Sentiment_score: number | string;
}

export const InteractionTable = () => {
  const params = useParams();
  const [dateFilter, setDateFilter] = useState<string>(""); // 날짜 필터
  const [emotionFilter, setEmotionFilter] = useState<string>(""); // 감정 필터
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({}); // Analyze 로딩 상태

  // Firebase 데이터 가져오기
  const { data, isLoading, refetch } = useList({
    resource: "interaction",
    filters: [
      {
        field: "contact_id",
        operator: "eq",
        value: params?.id,
      },
    ],
  });

  // 데이터 가공
  const interactions = useMemo<Interaction[]>(() => {
    return (
      (data?.data || []).map((interaction: any) => ({
        id: interaction.id,
        date: interaction.date || "Unknown date",
        notes: interaction.notes || "No notes available",
        Classification: interaction.classification?.Classification || "N/A",
        Sentiment_score: interaction.classification?.Sentiment_score ?? "N/A",
      })) || []
    );
  }, [data]);

  // 필터링된 데이터
  const filteredInteractions = useMemo(() => {
    return interactions.filter(
      (interaction) =>
        interaction.date.toLowerCase().includes(dateFilter.toLowerCase()) &&
        interaction.Classification.toLowerCase().includes(
          emotionFilter.toLowerCase()
        )
    );
  }, [interactions, dateFilter, emotionFilter]);

  // Analyze 버튼 클릭 핸들러
  const handleAnalyze = async (interaction: Interaction) => {
    const id = interaction.id;
    setAnalyzingIds((prev) => ({ ...prev, [id]: true })); // 특정 항목 로딩 상태 설정

    try {
      const analysisResult = await callAIStudio(
        [{ id, notes: interaction.notes }],
        "Review Classification"
      );

      await updateDbWithChatbot(id, "Review Classification", "interaction", {
        Classification: analysisResult[0].Classification,
        Sentiment_score: analysisResult[0].Sentiment_score,
      });

      // 데이터 새로고침
      await refetch();
    } catch (error) {
      console.error(`Error analyzing interaction ${id}:`, error);
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [id]: false })); // 로딩 상태 해제
    }
  };

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
          filterDropdown={() => (
            <Input
              placeholder="Search Date"
              onChange={(e) => setDateFilter(e.target.value)}
            />
          )}
        />
        <Table.Column
          title="Emotion"
          dataIndex="Classification"
          render={(Classification) => <Text>{Classification}</Text>}
          filterDropdown={() => (
            <Input
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
          render={(id, record) => (
            <Space>
              <Button>Edit</Button>
              <Button
                onClick={() => handleAnalyze(record as Interaction)}
                loading={!!analyzingIds[id]}
              >
                Analyze
              </Button>
              <Button danger>Delete</Button>
            </Space>
          )}
        />
      </Table>
    </Card>
  );
};
