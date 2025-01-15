import React, { useMemo, useState } from "react";
import {
  CreateButton,
  DeleteButton,
  EditButton,
  FilterDropdown,
  List,
} from "@refinedev/antd";
import { useGo, useList, useDelete, useMany } from "@refinedev/core";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { Input, Space, Table, Popconfirm, Button } from "antd";
import { PaginationTotal } from "../../../components/pagination-total";
import { Text } from "../../../components/text";
import { CustomAvatar } from "../../../components/custom-avatar"; // 아바타 컴포넌트
import { callAIStudio } from "../../../helpers/api/aiStudioApi"; // AI API 호출 함수
import { updateDbWithChatbot } from "../../../helpers/firebase/firestoreHelpers"; // Firestore 업데이트 함수
import magnifyingGlass from "../../../assets/icons/magnifying-glass.svg";

export const InteractionListPage = ({ children }: React.PropsWithChildren) => {
  const go = useGo();
  const [searchText, setSearchText] = useState("");
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});

  // 1) interaction 목록 불러오기
  const {
    data: interactionData,
    isLoading,
    refetch,
  } = useList({
    resource: "interaction",
    queryOptions: {
      onSuccess: (fetchedData) => {
        console.log("Fetched Interactions:", fetchedData?.data);
      },
    },
  });

  // 2) interaction에서 contact_id들을 모아서 useMany로 contact 정보 불러오기
  const contactIds = useMemo(() => {
    const allIds = (interactionData?.data || [])
      .map((item) => item.contact_id)
      .filter(Boolean); // undefined/null 제거
    return Array.from(new Set(allIds)); // 중복 제거
  }, [interactionData?.data]);

  // contact DB에서 가져오기
  const { data: contactsData, isLoading: isContactsLoading } = useMany({
    resource: "contact",
    ids: contactIds,
  });

  // 3) contact_id -> { name, avatarUrl } 매핑용 객체 만들기
  const contactMap = useMemo(() => {
    const map: Record<string, { name: string; avatarUrl?: string }> = {};
    if (contactsData?.data) {
      contactsData.data.forEach((contact) => {
        if (contact.id) {
          map[contact.id] = {
            name: contact.name || "No contact name",
            avatarUrl: contact.avatarUrl,
          };
        }
      });
    }
    return map;
  }, [contactsData?.data]);

  // 4) interaction 배열을 가공해서 테이블에 뿌릴 데이터 만들기
  const interactions = useMemo(() => {
    return (
      (interactionData?.data || []).map((interaction) => {
        const contactInfo = contactMap[interaction.contact_id] || {};
        return {
          ...interaction,
          contactName: contactInfo.name ?? "No contact name",
          contactAvatar: contactInfo.avatarUrl ?? "",
          Classification: interaction.classification?.Classification || "N/A",
          Sentiment_score: interaction.classification?.Sentiment_score ?? "N/A",
          notes: interaction.notes || "No notes available",
          date: interaction.date || "Unknown date",
        };
      }) || []
    );
  }, [interactionData, contactMap]);

  // 노트 검색 필터링
  const filteredInteractions = useMemo(() => {
    return interactions.filter((interaction) =>
      interaction.notes?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [interactions, searchText]);

  const { mutate: deleteInteraction } = useDelete();

  // Interaction 삭제 핸들러
  const handleDelete = (id: string) => {
    deleteInteraction(
      { resource: "interaction", id },
      {
        onSuccess: () => {
          console.log(`Interaction with id ${id} deleted successfully.`);
          refetch();
        },
        onError: (error) => {
          console.error("Failed to delete interaction:", error);
        },
      }
    );
  };

  // Analyze 버튼 클릭 핸들러
  const handleAnalyze = async (interaction: any) => {
    const id = interaction.id;
    setAnalyzingIds((prev) => ({ ...prev, [id]: true }));

    try {
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
      refetch();
    } catch (error) {
      console.error(`Error analyzing interaction ${id}:`, error);
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [id]: false }));
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
        loading={isLoading || isContactsLoading}
      >
        {/* 날짜 정렬 */}
        <Table.Column
          dataIndex="date"
          title="Date"
          render={(text) => <Text>{text}</Text>}
          sorter={(a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          }
        />

        {/* Contact Name + Avatar */}
        <Table.Column
          title="Contact"
          dataIndex="contactName"
          render={(_, record) => (
            <Space>
              <CustomAvatar
                shape="square"
                name={record.contactName}
                src={record.contactAvatar}
              />
              <Text>{record.contactName}</Text>
            </Space>
          )}
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
              <EditButton hideText size="small" recordItemId={value} />

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
                  style={{ width: "16px", height: "16px", display: "block" }}
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
                  <DeleteOutlined
                    style={{ width: "16px", height: "16px", color: "red" }}
                  />
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
