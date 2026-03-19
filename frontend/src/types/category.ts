import { TransactionType } from "./transaction";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  typeName: string;
}

export interface CreateCategoryDto {
  name: string;
  type: TransactionType;
}

export interface UpdateCategoryDto {
  name: string;
  type: TransactionType;
}
