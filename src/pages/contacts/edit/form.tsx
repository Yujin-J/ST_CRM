import { Edit } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useOne, useUpdate, useList } from "@refinedev/core";
import { CustomAvatar } from "../../../components/custom-avatar";
import { getNameInitials } from "../../../utilities/get-name-initials";
import { SelectOptionWithAvatar } from "../../../components/select-option-with-avatar";
import React from "react";

export const CustomerForm = () => {
  const [form] = Form.useForm();
  const params = useParams();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate } = useUpdate();
  const { data, isLoading: isLoadingContact } = useOne({
    resource: "contact",
    id: params?.id || "",
  });

  const { data: usersData, isLoading: isLoadingUsers } = useList({
    resource: "user",
  });

  const { data: customersData } = useList({
    resource: "customer",
  });

  const customers = customersData?.data || [];
  const customer = data?.data;
  const users = usersData?.data || [];

  const onFinish = (values: any) => {
    mutate(
      {
        resource: "contact",
        id: params?.id || "",
        values: values,
      },
      {
        onSuccess: () => {
          message.success("Contact updated successfully"); // navigate 이전에 메시지 표시
          navigate(-1); // 이전 페이지로 이동
        },
        onError: (error) => {
          messageApi.error("Error updating customer");
        },
      }
    );
  };

  if (isLoadingContact) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {contextHolder}
      <Edit
        isLoading={isLoadingContact}
        saveButtonProps={{ onClick: form.submit }}
        breadcrumb={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={customer}
        >
          <CustomAvatar
            shape="square"
            src={customer?.avatarUrl}
            name={getNameInitials(customer?.name)}
            style={{
              width: 96,
              height: 96,
              marginBottom: "24px",
            }}
          />

          <Form.Item label="Customer" name={["customer", "id"]}>
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
          <Form.Item label="Country" name="country">
            <Input placeholder="Country" value={customer?.country ?? ""} />
          </Form.Item>
          <Form.Item label="Website" name="website">
            <Input placeholder="Website" value={customer?.website ?? ""} />
          </Form.Item>
          <Form.Item label="email" name="email">
            <Input placeholder="email" value={customer?.email ?? ""} />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input placeholder="Address" value={customer?.address ?? ""} />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input placeholder="Phone" value={customer?.phone ?? ""} />
          </Form.Item>
        </Form>
      </Edit>
    </>
  );
};

const companySizeOptions = [
  { label: "Enterprise", value: "ENTERPRISE" },
  { label: "Large", value: "LARGE" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Small", value: "SMALL" },
];

const industryOptions = [
  { label: "Aerospace", value: "AEROSPACE" },
  { label: "Agriculture", value: "AGRICULTURE" },
  { label: "Automotive", value: "AUTOMOTIVE" },
  { label: "Chemicals", value: "CHEMICALS" },
  { label: "Construction", value: "CONSTRUCTION" },
  { label: "Defense", value: "DEFENSE" },
  { label: "Education", value: "EDUCATION" },
  { label: "Energy", value: "ENERGY" },
  { label: "Financial Services", value: "FINANCIAL_SERVICES" },
  { label: "Food and Beverage", value: "FOOD_AND_BEVERAGE" },
  { label: "Government", value: "GOVERNMENT" },
  { label: "Healthcare", value: "HEALTHCARE" },
  { label: "Hospitality", value: "HOSPITALITY" },
  { label: "Industrial Manufacturing", value: "INDUSTRIAL_MANUFACTURING" },
  { label: "Insurance", value: "INSURANCE" },
  { label: "Life Sciences", value: "LIFE_SCIENCES" },
  { label: "Logistics", value: "LOGISTICS" },
  { label: "Media", value: "MEDIA" },
  { label: "Mining", value: "MINING" },
  { label: "Nonprofit", value: "NONPROFIT" },
  { label: "Other", value: "OTHER" },
  { label: "Pharmaceuticals", value: "PHARMACEUTICALS" },
  { label: "Professional Services", value: "PROFESSIONAL_SERVICES" },
  { label: "Real Estate", value: "REAL_ESTATE" },
  { label: "Retail", value: "RETAIL" },
  { label: "Technology", value: "TECHNOLOGY" },
  { label: "Telecommunications", value: "TELECOMMUNICATIONS" },
  { label: "Transportation", value: "TRANSPORTATION" },
  { label: "Utilities", value: "UTILITIES" },
];

const businessTypeOptions = [
  { label: "B2B", value: "B2B" },
  { label: "B2C", value: "B2C" },
  { label: "B2G", value: "B2G" },
];
