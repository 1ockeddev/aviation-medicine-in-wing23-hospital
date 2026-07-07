import { Medication, Category, User } from '@prisma/client';

export type { Medication, Category, User };

export type MedicationWithCategory = Medication & {
  category: Category;
};

export type CategoryWithChildren = Category & {
  children: Category[];
};

export type CategoryWithMedicationCount = Category & {
  _count: {
    medications: number;
  };
};

export type SearchParams = {
  query?: string;
  page?: string;
  categoryId?: string;
};

export type ActionState<T = void> = {
  success?: boolean;
  error?: string | Record<string, string[]>;
  data?: T;
};
