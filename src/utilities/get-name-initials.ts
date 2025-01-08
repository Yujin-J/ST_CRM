export const getNameInitials = (name?: string): string => {
  if (!name) return "N/A"; // 기본값 설정
  const [first, last] = name.split(" ");
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
};