import React, { useState } from "react";
import {
  CreateButton,
  DeleteButton,
  EditButton,
  FilterDropdown,
  List,
} from "@refinedev/antd";
import { useGo, useList } from "@refinedev/core";
import { Input, Space, Table } from "antd";
import { PaginationTotal } from "../../../components/pagination-total";
import { CustomAvatar } from "../../../components/custom-avatar";
import { Text } from "../../../components/text";
import { useDelete } from "@refinedev/core";
import { Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { message } from "antd";

export const ContactListPage = ({ children }: React.PropsWithChildren) => {
  const go = useGo();
  const [searchText, setSearchText] = useState("");

  // contact와 interaction 데이터를 가져옵니다.
  const { data: contactData } = useList({
    resource: "contact",
  });

  const { data: interactionData } = useList({
    resource: "interaction",
  });

  const contacts = contactData?.data || [];
  const interactions = interactionData?.data || [];

  // 검색 필터링
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const { mutate: deleteContact } = useDelete();
  const handleDelete = (id) => {
    deleteContact(
      {
        resource: "contact",
        id: id,
      },
      {
        onSuccess: () => {
          console.log(`Contact with id ${id} deleted successfully.`);
          message.success("Contact has been deleted successfully!");
        },
        onError: (error) => {
          console.error("Failed to delete contact:", error);
        },
      }
    );
  };

  return (
    <>
      <List
        breadcrumb={false}
        headerButtons={() => (
          <CreateButton
            onClick={() => {
              go({
                to: { resource: "contacts", action: "create" },
                options: { keepQuery: true },
                type: "replace",
              });
            }}
          />
        )}
      >
        <Table
          dataSource={filteredContacts}
          pagination={{
            total: filteredContacts.length,
            pageSize: 12,
            pageSizeOptions: ["12", "24", "48", "96"],
            position: ["bottomCenter"], // 페이지 버튼을 하단 중앙으로 위치 조정

            showTotal: (total) => (
              <PaginationTotal total={total} entityName="contacts" />
            ),
          }}
          rowKey="id"
        >
          <Table.Column
            dataIndex="name"
            title="Contact name"
            render={(_, record) => (
              <Space>
                <CustomAvatar
                  shape="square"
                  name={record.name}
                  src={record.avatarUrl}
                />
                <Text style={{ whiteSpace: "nowrap" }}>{record.name}</Text>
              </Space>
            )}
          />
          <Table.Column
            dataIndex="totalInteractions"
            title="Total interactions"
            render={(_, contact) => {
              // interaction 데이터에서 해당 contact의 interaction을 필터링
              const contactInteractions = interactions.filter(
                (interaction) => interaction.contact_id === contact.id
              );
              return <Text>{contactInteractions?.length || 0}</Text>;
            }}
          />
          <Table.Column
            fixed="right"
            dataIndex="id"
            title="Actions"
            render={(value) => (
              <Space>
                <EditButton hideText size="small" recordItemId={value} />
                <Popconfirm
                  title="Are you sure you want to delete this contact?"
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
                      color: "red",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DeleteOutlined />
                  </button>
                </Popconfirm>
              </Space>
            )}
          />
        </Table>
      </List>
      {children}
    </>
  );
};
