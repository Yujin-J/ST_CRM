import { useGo, useList, useCreate } from "@refinedev/core";
import { Form, Input, Modal, Select, DatePicker } from "antd";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { SelectOptionWithAvatar } from "../../../components/select-option-with-avatar";
import { message } from "antd";
import { callAIStudio } from "../../../helpers/api/aiStudioApi"; // AI API 호출 함수
import { updateDbWithChatbot } from "../../../helpers/firebase/firestoreHelpers"; // Firestore 업데이트 함수

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
    const dateValue = values.date
      ? dayjs(values.date).format("YYYY-MM-DD")
      : "";

    const payload = {
      contact_id: values.contact_id || "",
      date: dateValue,
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

          // 성공 메시지 표시
          message.success("Interaction has been added successfully!");

          // 분석 함수 호출
          const interactionId = createdData?.data?.id; // 생성된 데이터의 ID 가져오기
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
            // contact db에 있는 name, avatarUrl 정보를 띄워주고 value는 contact의 id
            options={contacts.map((contact) => ({
              value: contact.id ?? "",
              label: (
                <SelectOptionWithAvatar
                  name={contact.name}
                  avatarUrl={contact.avatarUrl} // 없으면 placeholder 또는 이니셜처리
                />
              ),
            }))}
          />
        </Form.Item>

        {/* Date 입력 */}
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select date"
            // 날짜 형식 지정 예시
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
