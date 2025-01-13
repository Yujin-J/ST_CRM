import { InteractionListPage } from "../list";
import { InteractionCreateModal } from "../list/createModal";

export const InteractionCreatePage = () => {
  return (
    <InteractionListPage>
      <InteractionCreateModal />
    </InteractionListPage>
  );
};
