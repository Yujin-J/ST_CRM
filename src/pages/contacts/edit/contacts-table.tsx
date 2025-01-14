import React, { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button, Card, Space, Table } from "antd";
import { Text } from "../../../components/text";
import { useParams } from "react-router";
import { callAIStudio } from "../../../helpers/api/aiStudioApi"; // AI API 호출 함수
import { updateDbWithChatbot } from "../../../helpers/firebase/firestoreHelpers"; // Firestore 업데이트 함수

export const InteractionTable = () => {
  const params = useParams();
  const [dateFilter, setDateFilter] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("");
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({}); // 개별 로딩 상태 관리

  // Fetch interaction data from Firebase
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

  // 데이터를 Interaction[] 형태로 매핑
  const interactions = useMemo(() => {
    return (
      (data?.data || []).map((interaction) => ({
        ...interaction,
        Classification: interaction.classification?.Classification || "N/A",
        Sentiment_score: interaction.classification?.Sentiment_score ?? "N/A",
      })) || []
    );
  }, [data]);

  // 필터링 로직
  const filteredInteractions = useMemo(() => {
    return interactions.filter(
      (interaction) =>
        interaction.date.toLowerCase().includes(dateFilter.toLowerCase()) &&
        interaction.Classification.toLowerCase().includes(emotionFilter.toLowerCase())
    );
  }, [interactions, dateFilter, emotionFilter]);

  // Analyze 버튼 클릭 핸들러
  const handleAnalyze = async (interaction) => {
    const id = interaction.id;
    setAnalyzingIds((prev) => ({ ...prev, [id]: true })); // 특정 항목 로딩 상태 설정

    try {
      // AI Studio API 호출
      const analysisResult = await callAIStudio(
        [{ id, notes: interaction.notes }],
        "Review Classification"
      );

      console.log("Analysis Result:", analysisResult);

      // Firestore에 분석 결과 업데이트
      await updateDbWithChatbot(id, "Review Classification", "interaction", {
        Classification: analysisResult[0].Classification,
        Sentiment_score: analysisResult[0].Sentiment_score,
      });

      console.log(`Interaction ${id} analyzed successfully!`);

      // 데이터 새로고침
      await refetch();
    } catch (error) {
      console.error(`Error analyzing interaction ${id}:`, error);
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [id]: false })); // 특정 항목 로딩 상태 해제
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
        loading={isLoading} // 전체 테이블 로딩 상태
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
          render={(id, record) => (
            <Space>
              <Button>Edit</Button>
              <Button
                onClick={() => handleAnalyze(record)} // Analyze 버튼 클릭 핸들러 연결
                loading={!!analyzingIds[id]} // 특정 버튼 로딩 상태
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
