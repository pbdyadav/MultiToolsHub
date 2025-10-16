export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  tools: Tool[];
}