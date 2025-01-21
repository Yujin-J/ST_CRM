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
import { CustomAvatar } from "../../../components/custom-avatar";
import { callAIStudio } from "../../../helpers/api/aiStudioApi";
import { updateDbWithChatbot } from "../../../helpers/firebase/firestoreHelpers";
import magnifyingGlass from "../../../assets/icons/magnifying-glass.svg";
import dayjs, { Dayjs } from "dayjs";

type Interaction = {
  id: string;
  classification?: {
    Classification?: string;
    Sentiment_score?: number;
  };
  contact_id?: string;
  created_at?: string;
  date?: string;
  time?: string;
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
  const [classificationFilter, setClassificationFilter] = useState<string | null>(null); // Classification 필터 상태 추가
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});

  const { data: interactionData, isLoading, refetch } = useList<Interaction, Error>({
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

  const contactIds = useMemo(() => {
    const allIds = (interactionData?.data || [])
      .map((item) => item.contact_id)
      .filter(Boolean);
    return Array.from(new Set(allIds));
  }, [interactionData?.data]);

  const { data: contactsData, isLoading: isContactsLoading } = useMany<Contact, Error>({
    resource: "contact",
    ids: contactIds,
    queryOptions: {
      onSuccess: (fetchedContacts) => {
        console.log("Fetched Contacts:", fetchedContacts?.data);
      },
    },
  });

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

  const interactions = useMemo(() => {
    const sorted = [...(interactionData?.data || [])].sort((a, b) => {
      const dateA = new Date(a.created_at || "").getTime();
      const dateB = new Date(b.created_at || "").getTime();
      return dateB - dateA;
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

  const filteredInteractions = useMemo(() => {
    return interactions.filter((interaction) => {
      const searchTarget = [
        interaction.notes,
        interaction.classification?.Classification,
        interaction.classification?.Sentiment_score,
        interaction.contact_id,
      ];
  
const matchesSearch = searchTarget.some((field) =>
    field?.toString().toLowerCase().includes(searchText.toLowerCase())
);

  
      const matchesClassification =
        !classificationFilter || interaction.Classification === classificationFilter;
  
      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const interactionDate = dayjs(interaction.createdAt);
        matchesDate =
          interactionDate.isAfter(dateRange[0].startOf("day")) &&
          interactionDate.isBefore(dateRange[1].endOf("day"));
      }
  
      return matchesSearch && matchesDate && matchesClassification;
    });
  }, [interactions, searchText, dateRange, classificationFilter]);

  const { mutate: deleteInteraction } = useDelete();

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
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <DatePicker.RangePicker
          onChange={handleDateChange}
          disabledDate={(current) => current && current > dayjs().endOf("day")}
          format="YYYY-MM-DD"
          allowClear
          style={{ minWidth: 250 }}
        />
        {/* 노트 검색 필터 */}
        <Input
          placeholder="Search by keywords"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        dataSource={filteredInteractions}
        onChange={(pagination, filters, sorter) => {
          const classificationFilterValue = filters.Classification?.[0] as string | undefined;
          setClassificationFilter(classificationFilterValue || null);
        }}
        pagination={{
          total: filteredInteractions.length,
          pageSize: 12,
          pageSizeOptions: ["12", "24", "48", "96"],
          position: ["bottomCenter"],
          showTotal: (total) => (
            <PaginationTotal total={filteredInteractions.length} entityName="interactions" />
          ),
        }}
        rowKey="id"
        loading={isLoading || isContactsLoading}
      >
        <Table.Column
          dataIndex="createdAt"
          title="Date & Time"
          width={150} // Fixed width
          render={(text) => <Text>{dayjs(text).format("YYYY-MM-DD HH:mm:ss")}</Text>}
          sorter={(a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          }
          defaultSortOrder="descend" // 기본 정렬 순서를 내림차순으로 설정
        />
        <Table.Column
          title="Contact"
          dataIndex="contactName"
          width={200} // Fixed width
          render={(_, record) => (
            <Space>
              <CustomAvatar shape="square" name={record.contactName} src={record.contactAvatar} />
              <Text>{record.contactName}</Text>
            </Space>
          )}
        />
        <Table.Column
          dataIndex="Classification"
          title="Classification"
          width={200} // Fixed width
          render={(text) => <Text>{text}</Text>}
          filters={[
            { text: "Positive Review", value: "Positive Review" },
            { text: "Negative Review", value: "Negative Review" },
            { text: "Neutral Review", value: "Neutral Review" },
            { text: "N/A", value: "N/A" },
          ]}
        />
        <Table.Column
          dataIndex="Sentiment_score"
          title="Sentiment Score"
          width={150} // Fixed width
          render={(text) => <Text>{text}</Text>}
          sorter={(a, b) => {
            const scoreA = typeof a.Sentiment_score === "number" ? a.Sentiment_score : 0;
            const scoreB = typeof b.Sentiment_score === "number" ? b.Sentiment_score : 0;
            return scoreA - scoreB;
          }}
        />
        <Table.Column
          dataIndex="notes"
          title="Notes"
          width={300} // Fixed width
          render={(text) => (
            <Tooltip title={text} mouseEnterDelay={0.5} mouseLeaveDelay={0.1}>
              <span>{text.length > 30 ? `${text.slice(0, 30)}...` : text}</span>
            </Tooltip>
          )}
        />
        <Table.Column
          title="Actions"
          dataIndex="id"
          width={130} // Fixed width
          render={(value, record) => (
            <Space>
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
