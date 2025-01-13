import { useMemo, useState } from "react";
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
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Analyze 버튼 상태 관리
  const [interactions, setInteractions] = useState([]); // 데이터를 상태로 관리

  // Fetch interaction data from Firebase
  const { data, isLoading } = useList({
    resource: "interaction",
    filters: [
      {
        field: "contact_id",
        operator: "eq",
        value: params?.id,
      },
    ],
    queryOptions: {
      onSuccess: (fetchedData) => {
        // 초기 데이터 설정
        setInteractions(
          (fetchedData?.data || []).map((interaction) => ({
            ...interaction,
            Classification: interaction.classification?.Classfication || "N/A",
            Sentiment_score: interaction.classification?.Sentiment_score ?? "N/A",
          }))
        );
      },
    },
  });

  console.log("Interactions:", interactions);

  // 필터링 로직
  const filteredInteractions = useMemo(() => {
    return interactions.filter(
      (interaction) =>
        interaction.date.toLowerCase().includes(dateFilter.toLowerCase()) &&
        interaction.emotion.toLowerCase().includes(emotionFilter.toLowerCase())
    );
  }, [interactions, dateFilter, emotionFilter]);

  // Analyze 버튼 클릭 핸들러
  const handleAnalyze = async (interaction) => {
    setIsAnalyzing(true); // 분석 상태 시작
    try {
      // AI Studio API 호출
      const analysisResult = await callAIStudio(
        [{ id: interaction.id, notes: interaction.notes }],
        "Review Classification"
      );

      console.log("Analysis Result:", analysisResult);

      // Firestore에 분석 결과 업데이트
      await updateDbWithChatbot(interaction.id, "Review Classification", "interaction", {
        Classfication: analysisResult[0].Classification,
        Sentiment_score: analysisResult[0].Sentiment_score,
      });

      // 상태 업데이트로 UI 갱신
      setInteractions((prev) =>
        prev.map((item) =>
          item.id === interaction.id
            ? {
                ...item,
                Classification: analysisResult[0].Classification,
                Sentiment_score: analysisResult[0].Sentiment_score,
              }
            : item
        )
      );

      console.log(`Interaction ${interaction.id} analyzed successfully!`);
    } catch (error) {
      console.error(`Error analyzing interaction ${interaction.id}:`, error);
    } finally {
      setIsAnalyzing(false); // 분석 상태 종료
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
        loading={isLoading || isAnalyzing} // 로딩 상태 추가
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
                loading={isAnalyzing}
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
