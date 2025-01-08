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
import { useDelete } from "@refinedev/core"
import { firestoreDataProvider } from "../../../helpers/firebase/firebaseConfig"
import { Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons"

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

  const {mutate: deleteCustomer } = useDelete();

  const handleDelete = (id) => {
    deleteCustomer(
      {
        resource: "customer",
        id: id,
      },
      {
        onSuccess: () => {
          // Optionally, you can refetch the list or show a success message
          console.log(`Customer with id ${id} deleted successfully.`);
        },
        onError: (error) => {
          console.error("Failed to delete customer:", error);
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
                <Popconfirm
                  title="Are you sure you want to delete this customer?"
                  onConfirm={() => handleDelete(value)} // 실제 삭제 로직은 여기서만 실행
                  okText="Yes"
                  cancelText="No"
                >
                <button
                  style={{
                    background: "none",
                    border: "1px solid #d9d9d9", // 테두리 추가
                    borderRadius: "4px",         // 모서리를 약간 둥글게
                    cursor: "pointer",
                    padding: "4px",          // 버튼 안 여백 추가
                    color: "red",
                    display: "flex",             // 아이콘 정렬
                    alignItems: "center",
                    justifyContent: "center",
                  }}
        >
          <DeleteOutlined /> {/* 아이콘을 유지 */}
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
