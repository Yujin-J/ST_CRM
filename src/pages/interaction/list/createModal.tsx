import { useGo, useList, useCreate } from "@refinedev/core";
import { Form, Input, Modal, Select, InputNumber } from "antd";
import { useState } from "react";
import { SelectOptionWithAvatar } from "../../../components/select-option-with-avatar";

const companySizeOptions = [
  { label: "Small", value: "Small" },
  { label: "Medium", value: "Medium" },
  { label: "Large", value: "Large" },
];

const industryOptions = [
  { label: "Technology", value: "Technology" },
  { label: "Finance", value: "Finance" },
  { label: "Healthcare", value: "Healthcare" },
];

const businessTypeOptions = [
  { label: "B2B", value: "B2B" },
  { label: "B2C", value: "B2C" },
];

export const InteractionCreateModal = () => {
  const go = useGo();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(true);

  // Firestore에서 user 데이터 가져오기
  const { data: usersData } = useList({
    resource: "user",
  });
  const { mutate: createContact } = useCreate();

  const users = usersData?.data || []; // Firestore의 user 데이터

  const { data: customersData, isLoading: isLoadingCustomers } = useList({
    resource: "customer",
  })
  const customers = customersData?.data || [];

  const goToListPage = () => {
    go({
      to: { resource: "contacts", action: "list" },
      options: { keepQuery: true },
      type: "replace",
    });
  };

  const onFinish = (values: any) => {
    const sanitizedValues = Object.fromEntries(
      Object.entries(values).map(([keys, value]) => [keys, value ?? ""])
    );
    createContact(
      {
        resource: "contact",
        values: sanitizedValues,
      },
      {
        onSuccess: () => {
          console.log("Contact added successfully:", sanitizedValues);
          goToListPage(); // 모달 닫고 고객 목록으로 이동
        },
        onError: (error) => {
          console.error("Failed to add contact:", error);
        },
      }
    );
  };



  return (
    <Modal
      open={visible}
      onOk={form.submit}
      onCancel={goToListPage}
      mask={true}
      title="Add new contact"
      width={512}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Contact name"
          name="name"
          rules={[{ required: true }]}
        >
          <Input placeholder="Please enter contact name" />
        </Form.Item>
        <Form.Item label="Customer" name={["customer", "id"]}
        rules={[{ required: true, message: "Please select a customer" }]}
        >
          <Select
            placeholder="Please select customer"
            options={customers.map((customer) => ({
              value: customer.id ?? "",
              label: (
                <SelectOptionWithAvatar
                  name={customer.name}
                  avatarUrl={customer.avatarUrl}
                />
              ),
            }))}
          />
        </Form.Item>
        <Form.Item label="Company size" name="companySize">
          <Select options={companySizeOptions} />
        </Form.Item>
        <Form.Item label="Total revenue" name="totalRevenue">
          <InputNumber
            autoFocus
            addonBefore={"$"}
            min={0}
            placeholder="0,00"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </Form.Item>
        <Form.Item label="Industry" name="industry">
          <Select options={industryOptions} />
        </Form.Item>
        <Form.Item label="Business type" name="businessType">
          <Select options={businessTypeOptions} />
        </Form.Item>
        <Form.Item label="Country" name="country">
          <Input placeholder="Country" />
        </Form.Item>
        <Form.Item label="Website" name="website">
          <Input placeholder="Website" />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item label="Address" name="address">
          <Input placeholder="Address" />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input placeholder="Phone" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
