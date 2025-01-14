import React, { useMemo, useState } from "react";
import {
  CreateButton,
  DeleteButton,
  EditButton,
  FilterDropdown,
  List,
} from "@refinedev/antd";
import { useGo, useList, useDelete } from "@refinedev/core";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { Input, Space, Table, Popconfirm, Button } from "antd";
import { PaginationTotal } from "../../../components/pagination-total";
import { Text } from "../../../components/text";
import { callAIStudio } from "../../../helpers/api/aiStudioApi"; // AI API 호출 함수
import { updateDbWithChatbot } from "../../../helpers/firebase/firestoreHelpers"; // Firestore 업데이트 함수
import magnifyingGlass from "../../../assets/icons/magnifying-glass.svg";

export const InteractionListPage = ({ children }: React.PropsWithChildren) => {
  const go = useGo();
  const [searchText, setSearchText] = useState(""); // 노트 검색 필터
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({}); // 개별 로딩 상태 관리

  // Fetch interaction data
  const { data: interactionData, isLoading, refetch } = useList({
    resource: "interaction",
    queryOptions: {
      onSuccess: (fetchedData) => {
        console.log("Fetched Interactions:", fetchedData?.data);
      },
    },
  });

  const interactions = useMemo(() => {
    return (
      (interactionData?.data || []).map((interaction) => ({
        ...interaction,
        Classification: interaction.classification?.Classification || "N/A", // Classification 필드
        Sentiment_score:
          interaction.classification?.Sentiment_score ?? "N/A", // Sentiment_score 필드
        notes: interaction.notes || "No notes available", // 노트 필드
        date: interaction.date || "Unknown date", // 날짜 필드
      })) || []
    );
  }, [interactionData]);

  // 노트 검색 필터링
  const filteredInteractions = useMemo(() => {
    return interactions.filter((interaction) =>
      interaction.notes.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [interactions, searchText]);

  const { mutate: deleteInteraction } = useDelete();

  // Interaction 삭제 핸들러
  const handleDelete = (id) => {
    deleteInteraction(
      { resource: "interaction", id },
      {
        onSuccess: () => {
          console.log(`Interaction with id ${id} deleted successfully.`);
          refetch(); // 삭제 후 데이터 갱신
        },
        onError: (error) => {
          console.error("Failed to delete interaction:", error);
        },
      }
    );
  };

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

      // 데이터 갱신
      refetch();
    } catch (error) {
      console.error(`Error analyzing interaction ${id}:`, error);
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [id]: false })); // 특정 항목 로딩 상태 해제
    }
  };

  return (
    <List
      breadcrumb={false}
      headerButtons={() => (
        <CreateButton
          onClick={() => {
            go({
              to: { resource: "interaction", action: "create" },
              options: { keepQuery: true },
              type: "replace",
            });
          }}
        />
      )}
    >
      <Table
        dataSource={filteredInteractions}
        pagination={{
          total: filteredInteractions.length,
          pageSize: 12,
          pageSizeOptions: ["12", "24", "48", "96"],
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="interactions" />
          ),
        }}
        rowKey="id"
        loading={isLoading}
      >
        {/* 날짜 정렬 */}
        <Table.Column
          dataIndex="date"
          title="Date"
          render={(text) => <Text>{text}</Text>}
          sorter={(a, b) => new Date(a.date) - new Date(b.date)}
        />

        {/* 노트 검색 */}
        <Table.Column
          dataIndex="notes"
          title="Notes"
          render={(text) => <Text>{text}</Text>}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Notes"
                onChange={(e) => setSearchText(e.target.value)}
              />
            </FilterDropdown>
          )}
        />

        {/* 분류별 필터링 */}
        <Table.Column
          dataIndex="Classification"
          title="Classification"
          render={(text) => <Text>{text}</Text>}
          filters={[
            { text: "Positive Review", value: "Positive Review" },
            { text: "Negative Review", value: "Negative Review" },
            { text: "Neutral Review", value: "Neutral Review" },
          ]}
          onFilter={(value, record) => record.Classification === value}
        />

        {/* 만족도 점수 정렬 */}
        <Table.Column
          dataIndex="Sentiment_score"
          title="Sentiment Score"
          render={(text) => <Text>{text}</Text>}
          sorter={(a, b) => a.Sentiment_score - b.Sentiment_score}
        />

        {/* 작업 버튼 */}
        <Table.Column
          title="Actions"
          dataIndex="id"
          render={(value, record) => (
            <Space>
              {/* Edit 버튼 */}
              <EditButton
                hideText
                size="small"
                recordItemId={value}
                style={{
                  background: "none",
                  border: "1px solid #d9d9d9",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}

              />

              {/* Analyze 버튼 */}
              <Button
                onClick={() => handleAnalyze(record)}
                loading={!!analyzingIds[value]}
                style={{
                  background: "none",
                  border: "1px solid #d9d9d9",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={magnifyingGlass}
                  alt="Analyze"
                  style={{ width: "16px", height: "16px", display: "block"
                  }}
                />
              </Button>

              {/* Delete 버튼 */}
              <Popconfirm
                title="Are you sure you want to delete this interaction?"
                onConfirm={() => handleDelete(value)}
                okText="Yes"
                cancelText="No"
              >
                <button
                  style={{
                    background: "none",
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DeleteOutlined style={{width: "16px", height: "16px", color: "red" }} />
                </button>
              </Popconfirm>
            </Space>
          )}
        />
      </Table>
      {children}
    </List>
  );
};
