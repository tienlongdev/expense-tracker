"use client";
import { categoryApi } from "@/lib/category-api";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "@/types/category";
import { TransactionType } from "@/types/transaction";
import { useCallback, useEffect, useState } from "react";

export function useCategories(type?: TransactionType) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = type
        ? await categoryApi.getByType(type)
        : await categoryApi.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const createCategory = async (dto: CreateCategoryDto) => {
    const result = await categoryApi.create(dto);
    await fetchCategories();
    return result;
  };

  const updateCategory = async (id: string, dto: UpdateCategoryDto) => {
    const result = await categoryApi.update(id, dto);
    await fetchCategories();
    return result;
  };

  const deleteCategory = async (id: string) => {
    await categoryApi.delete(id);
    await fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
