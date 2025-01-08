import React, { useState } from "react";
import {
  CreateButton,
  DeleteButton,
  EditButton,
  FilterDropdown,
  List,
} from "@refinedev/antd";
import { useGo, useList} from "@refinedev/core";
import { SearchOutlined } from "@ant-design/icons";
import { Input, Space, Table } from "antd";
import { PaginationTotal } from "../../../components/pagination-total";
import { CustomAvatar } from "../../../components/custom-avatar";
import { Text } from "../../../components/text";
import { currencyNumber } from "../../../utilities/currency-number";

export const ContactListPage = ({ children }: React.PropsWithChildren) => {
  const go = useGo();
  const [searchText, setSearchText] = useState("");

  // Firestore에서 contact 데이터 가져오기
  const { data, isLoading } = useList({
    resource: "contact",
  });

  // Firestore에서 가져온 데이터를 dataSource로 사용
  const contacts = data?.data || [];

  // 검색 필터링
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

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
            showTotal: (total) => (
              <PaginationTotal total={total} entityName="contacts" />
            ),
          }}
          rowKey="id"
        >
          <Table.Column
            dataIndex="name"
            title="Contact title"
            filterIcon={<SearchOutlined />}
            filterDropdown={(props) => (
              <FilterDropdown {...props}>
                <Input
                  placeholder="Search Contact"
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </FilterDropdown>
            )}
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
            dataIndex="totalRevenue"
            title="Open deals amount"
            render={(_, contact) => (
              <Text>
                {currencyNumber(contact?.dealsAggregate?.[0].sum?.value || 0)}
              </Text>
            )}
          />
          <Table.Column
            fixed="right"
            dataIndex="id"
            title="Actions"
            render={(value) => (
              <Space>
                <EditButton hideText size="small" recordItemId={value} />
                <DeleteButton hideText size="small" recordItemId={value} />
              </Space>
            )}
          />
        </Table>
      </List>
      {children}
    </>
  );
};
