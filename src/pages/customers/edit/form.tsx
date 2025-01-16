import { Edit } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, message } from "antd";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate 추가
import { useOne, useUpdate, useList } from "@refinedev/core";
import { CustomAvatar } from "../../../components/custom-avatar";
import { getNameInitials } from "../../../utilities/get-name-initials";
import { SelectOptionWithAvatar } from "../../../components/select-option-with-avatar";
import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase } from "../../../helpers/firebase/firebaseConfig";
import React, { useEffect, useState } from "react";
import { User } from "../../../types";

export const CustomerForm = () => {
  const [form] = Form.useForm();
  const params = useParams();
  const navigate = useNavigate(); // useNavigate 훅 추가
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate } = useUpdate();
  const { data, isLoading: isLoadingCustomer } = useOne({
    resource: "customer",
    id: params?.id || "",
  });

  const { data: usersData, isLoading: isLoadingUsers } = useList({
    resource: "user", // Firestore의 user 컬렉션
  });

  const customer = data?.data;
  const users = usersData?.data || []; // Firestore에서 가져온 user 데이터
  const onFinish = (values: any) => {
    mutate(
      {
        resource: "customer",
        id: params?.id || "",
        values: values,
      },
      {
        onSuccess: () => {
          message.success("Customer updated successfully"); // navigate 이전에 메시지 표시
          navigate(-1); // 이전 페이지로 이동
        },
        onError: (error) => {
          messageApi.error("Error updating customer");
        },
      }
    );
  };

  if (isLoadingCustomer) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {contextHolder}
      <Edit
        isLoading={isLoadingCustomer}
        saveButtonProps={{ onClick: form.submit }}
        breadcrumb={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            ...customer,
            Address: customer?.Address || "",
            Phone: customer?.Phone || "",
          }}
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

          <Form.Item label="Sales owner" name={["salesOwner", "id"]}>
            <Select
              placeholder="Please select sales owner"
              options={users.map((user) => ({
                value: user.id,
                label: (
                  <SelectOptionWithAvatar
                    name={user.name}
                    avatarUrl={user.avatarUrl}
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
          <Form.Item label="email" name="email">
            <Input placeholder="email" />
          </Form.Item>
          <Form.Item label="Address" name="Address">
            <Input placeholder="Address" />
          </Form.Item>
          <Form.Item label="Phone" name="Phone">
            <Input placeholder="Phone" />
          </Form.Item>
        </Form>
      </Edit>
    </>
  );
};

const companySizeOptions = [
  { label: "Enterprise", value: "ENTERPRISE" },
  {
    label: "Large",
    value: "LARGE",
  },
  {
    label: "Medium",
    value: "MEDIUM",
  },
  {
    label: "Small",
    value: "SMALL",
  },
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
  {
    label: "B2C",
    value: "B2C",
  },
  {
    label: "B2G",
    value: "B2G",
  },
];
