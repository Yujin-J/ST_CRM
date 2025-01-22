import { useGo, useList, useCreate } from "@refinedev/core";
import { Form, Input, Modal, Select, DatePicker, message } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { SelectOptionWithAvatar } from "../../../components/select-option-with-avatar";
import { callAIStudio } from "../../../helpers/api/aiStudioApi"; // AI API 호출 함수
import { updateDbWithChatbot } from "../../../helpers/firebase/firestoreHelpers"; // Firestore 업데이트 함수

// dayjs에 utc 플러그인 추가
dayjs.extend(utc);

export const InteractionCreateModal = () => {
  const go = useGo();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(true);

  // 1) contacts 데이터 가져오기 (이름 + 아바타용)
  const { data: contactsData } = useList({
    resource: "contact",
  });
  const contacts = contactsData?.data || [];

  // 2) interaction 생성 useCreate 훅
  const { mutate: createInteraction } = useCreate();

  // 모달 닫고 리스트 페이지로 이동
  const goToInteractionListPage = () => {
    go({
      to: { resource: "interaction", action: "list" },
      options: { keepQuery: true },
      type: "replace",
    });
  };

  const onFinish = async (values: any) => {
    // dateValue를 23:59:59.000Z 형태로 설정

    // Payload를 생성(필요하다면 "date" 대신 "created_at"으로 key 변경)
    const payload = {
      contact_id: values.contact_id || "",
      date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : "", // DB 필드명이 date일 경우
      created_at: values.date
      ? dayjs(values.date)
          .utc() // UTC 기준
          .set("hour", 23)
          .set("minute", 59)
          .set("second", 59)
          .format("YYYY-MM-DDTHH:mm:ss.000[Z]")
      : "", // 만약 created_at 필드 사용 시
      notes: values.notes || "",
    };

    createInteraction(
      {
        resource: "interaction",
        values: payload,
      },
      {
        onSuccess: async (createdData) => {
          console.log("Interaction created successfully:", payload);
          message.success("Interaction has been added successfully!");

          // 생성된 Interaction의 ID
          const interactionId = createdData?.data?.id;
          if (interactionId) {
            try {
              const analysisResult = await callAIStudio(
                [{ id: interactionId as string, notes: payload.notes }],
                "Review Classification"
              );

              console.log("Analysis Result:", analysisResult);

              // Firestore에 분석 결과 업데이트
              await updateDbWithChatbot(
                interactionId as string,
                "Review Classification",
                "interaction",
                {
                  Classification: analysisResult[0].Classification,
                  Sentiment_score: analysisResult[0].Sentiment_score,
                }
              );

              console.log(
                `Interaction ${interactionId} analyzed successfully!`
              );
            } catch (error) {
              console.error(
                `Error analyzing interaction ${interactionId}:`,
                error
              );
            }
          }

          goToInteractionListPage(); // 생성 및 분석 후 이동
        },
        onError: (error) => {
          console.error("Failed to create interaction:", error);
        },
      }
    );
  };

  return (
    <Modal
      open={visible}
      onOk={form.submit}
      onCancel={goToInteractionListPage}
      mask={true}
      title="Add New Interaction"
      width={512}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Contact 선택 */}
        <Form.Item
          label="Contact"
          name="contact_id"
          rules={[{ required: true, message: "Please select a contact" }]}
        >
          <Select
            placeholder="Select a contact"
            options={contacts.map((contact) => ({
              value: contact.id ?? "",
              label: (
                <SelectOptionWithAvatar
                  name={contact.name}
                  avatarUrl={contact.avatarUrl}
                />
              ),
            }))}
          />
        </Form.Item>

        {/* DatePicker (날짜 선택) */}
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select date"
            format="YYYY-MM-DD"
          />
        </Form.Item>

        {/* Notes 입력 (리뷰) */}
        <Form.Item
          label="Notes"
          name="notes"
          rules={[{ required: true, message: "Please enter a review" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter your review or notes here"
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
