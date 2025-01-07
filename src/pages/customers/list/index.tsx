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

export const CustomerListPage = ({ children }: React.PropsWithChildren) => {
  const go = useGo();
  const [searchText, setSearchText] = useState("");

  // Firestore에서 customer 데이터 가져오기
  const { data, isLoading } = useList({
    resource: "customer",
  });

  // Firestore에서 가져온 데이터를 dataSource로 사용
  const customers = data?.data || [];

  // 검색 필터링
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <List
        breadcrumb={false}
        headerButtons={() => (
          <CreateButton
            onClick={() => {
              go({
                to: { resource: "customers", action: "create" },
                options: { keepQuery: true },
                type: "replace",
              });
            }}
          />
        )}
      >
        <Table
          dataSource={filteredCustomers}
          pagination={{
            total: filteredCustomers.length,
            pageSize: 12,
            pageSizeOptions: ["12", "24", "48", "96"],
            showTotal: (total) => (
              <PaginationTotal total={total} entityName="customers" />
            ),
          }}
          rowKey="id"
        >
          <Table.Column
            dataIndex="name"
            title="Customer title"
            filterIcon={<SearchOutlined />}
            filterDropdown={(props) => (
              <FilterDropdown {...props}>
                <Input
                  placeholder="Search Customer"
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
            render={(_, customer) => (
              <Text>
                {currencyNumber(customer?.dealsAggregate?.[0].sum?.value || 0)}
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
