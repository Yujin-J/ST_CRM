import React, { useMemo, useState } from "react";
import {
  CreateButton,
  EditButton,
  List,
} from "@refinedev/antd";
import { useGo, useList, useDelete, useMany } from "@refinedev/core";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { Input, Space, Table, Popconfirm, Button, DatePicker, message, Tooltip } from "antd";
import { PaginationTotal } from "../../../components/pagination-total";
import { Text } from "../../../components/text";
import { CustomAvatar } from "../../../components/custom-avatar"; // 아바타 컴포넌트
import { callAIStudio } from "../../../helpers/api/aiStudioApi"; // AI API 호출 함수
import { updateDbWithChatbot } from "../../../helpers/firebase/firestoreHelpers"; // Firestore 업데이트 함수
import magnifyingGlass from "../../../assets/icons/magnifying-glass.svg";
import dayjs, { Dayjs } from "dayjs"; // 날짜 처리 라이브러리

type Interaction = {
  id: string;
  classification?: {
    Classification?: string;
    Sentiment_score?: number;
  };
  contact_id?: string;
  created_at?: string; // ISO 형식의 날짜 및 시간
  date?: string; // "YYYY-MM-DD"
  time?: string; // "HH:mm:ss"
  notes?: string;
};

type Contact = {
  id: string;
  name?: string;
  avatarUrl?: string;
};

export const InteractionListPage = ({ children }: React.PropsWithChildren) => {
  const go = useGo();
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});

  // 1) interaction 목록 불러오기
  const {
    data: interactionData,
    isLoading,
    refetch,
  } = useList<Interaction, Error>({
    resource: "interaction",
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
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
  const { data: contactsData, isLoading: isContactsLoading } = useMany<Contact, Error>({
    resource: "contact",
    ids: contactIds,
    queryOptions: {
      onSuccess: (fetchedContacts) => {
        console.log("Fetched Contacts:", fetchedContacts?.data);
      },
    },
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
    const sorted = [...(interactionData?.data || [])].sort((a, b) => {
      const dateA = new Date(a.created_at || "").getTime();
      const dateB = new Date(b.created_at || "").getTime();
      return dateB - dateA; // 내림차순 정렬
    });

    return sorted.map((interaction) => {
      const contactInfo = contactMap[interaction.contact_id || ""] || {};
      return {
        ...interaction,
        contactName: contactInfo.name ?? "No contact name",
        contactAvatar: contactInfo.avatarUrl ?? "",
        Classification: interaction.classification?.Classification || "N/A",
        Sentiment_score: interaction.classification?.Sentiment_score ?? "N/A",
        notes: interaction.notes || "No notes available",
        createdAt: interaction.created_at || "Unknown date",
      };
    });
  }, [interactionData, contactMap]);

  // 노트 및 날짜 범위 검색 필터링
  const filteredInteractions = useMemo(() => {
    return interactions.filter((interaction) => {
      const matchesSearch = interaction.notes?.toLowerCase().includes(searchText.toLowerCase());
      let matchesDate = true;

      if (dateRange && dateRange[0] && dateRange[1]) {
        const interactionDate = dayjs(interaction.createdAt);
        matchesDate =
          interactionDate.isAfter(dateRange[0].startOf("day")) &&
          interactionDate.isBefore(dateRange[1].endOf("day"));
      }

      return matchesSearch && matchesDate;
    });
  }, [interactions, searchText, dateRange]);

  const { mutate: deleteInteraction } = useDelete();

  // Interaction 삭제 핸들러
  const handleDelete = (id: string) => {
    deleteInteraction(
      { resource: "interaction", id },
      {
        onSuccess: () => {
          console.log(`Interaction with id ${id} deleted successfully.`);
          message.success("Interaction has been deleted successfully!");
          refetch();
        },
        onError: (error) => {
          console.error("Failed to delete interaction:", error);
          message.error("Failed to delete interaction.");
        },
      }
    );
  };

  // Analyze 버튼 클릭 핸들러
  const handleAnalyze = async (interaction: Interaction) => {
    const id = interaction.id;
    setAnalyzingIds((prev) => ({ ...prev, [id]: true }));

    try {
      const analysisResult = await callAIStudio(
        [{ id, notes: interaction.notes || "" }],
        "Review Classification"
      );

      console.log("Analysis Result:", analysisResult);

      // Firestore에 분석 결과 업데이트
      await updateDbWithChatbot(id, "Review Classification", "interaction", {
        Classification: analysisResult[0].Classification,
        Sentiment_score: analysisResult[0].Sentiment_score,
      });

      console.log(`Interaction ${id} analyzed successfully!`);
      message.success("Analysis completed successfully!");
      refetch();
    } catch (error: any) {
      console.error(`Error analyzing interaction ${id}:`, error);
      message.error("Failed to analyze interaction.");
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  // 날짜 범위 변경 핸들러
  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
  };

  // 감정 분류에 따른 색상 반환 함수
  const getColorBySentiment = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "negative review":
        return "red";
      case "positive review":
        return "green";
      case "neutral review":
        return "gold";
      default:
        return "black"; // 기본 색상
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
      {/* 필터링 및 검색 영역 */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {/* 날짜 범위 선택기 */}
        <DatePicker.RangePicker
          onChange={handleDateChange}
          disabledDate={(current) => current && current > dayjs().endOf("day")}
          format="YYYY-MM-DD"
          allowClear
          style={{ minWidth: 250 }}
        />

        {/* 노트 검색 필터 */}
        <Input
          placeholder="Search Notes"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        dataSource={filteredInteractions}
        pagination={{
          total: filteredInteractions.length,
          pageSize: 12,
          pageSizeOptions: ["12", "24", "48", "96"],
          position: ["bottomCenter"], // 페이지 버튼을 하단 중앙으로 위치 조정

          showTotal: (total) => (
            <PaginationTotal total={total} entityName="interactions" />
          ),
        }}
        rowKey="id"
        loading={isLoading || isContactsLoading}
      >
        {/* 날짜 및 시간 정렬 */}
        <Table.Column
          dataIndex="createdAt"
          title="Date & Time"
          render={(text) => <Text>{dayjs(text).format("YYYY-MM-DD HH:mm:ss")}</Text>}
          sorter={(a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          }
          defaultSortOrder="descend" // 기본 정렬 순서를 내림차순으로 설정
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

        {/* 분류별 필터링 */}
        <Table.Column
          dataIndex="Classification"
          title="Classification"
          render={(text) => <Text>{text}</Text>}
          filters={[
            { text: "Positive Review", value: "Positive Review" },
            { text: "Negative Review", value: "Negative Review" },
            { text: "Neutral Review", value: "Neutral Review" },
            { text: "N/A", value: "N/A" },
          ]}
          onFilter={(value, record) => record.Classification === value}
        />

        {/* 만족도 점수 정렬 */}
        <Table.Column
          dataIndex="Sentiment_score"
          title="Sentiment Score"
          render={(text) => <Text>{text}</Text>}
          sorter={(a, b) => {
            const scoreA = typeof a.Sentiment_score === "number" ? a.Sentiment_score : 0;
            const scoreB = typeof b.Sentiment_score === "number" ? b.Sentiment_score : 0;
            return scoreA - scoreB;
          }}
        />

        {/* Notes 컬럼 추가 */}
        <Table.Column
          dataIndex="notes"
          title="Notes"
          render={(text) => (
            <Tooltip title={text} mouseEnterDelay={0.5} mouseLeaveDelay={0.1}>
              <span>{text.length > 30 ? `${text.slice(0, 30)}...` : text}</span>
            </Tooltip>
          )}
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
                aria-label="Analyze Interaction"
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
                  aria-label="Delete Interaction"
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
