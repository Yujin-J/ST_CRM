export interface User {
    id: string;
    name: string;
    avatarUrl: string;
    dealsAggregate: { sum: { value: number } }[];
  }