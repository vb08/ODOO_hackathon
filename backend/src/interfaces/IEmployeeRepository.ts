import { Prisma, Employee } from "@prisma/client";

/**
 * Interface contract for Employee Repository (SOLID).
 */
export interface IEmployeeRepository {
  create(data: Prisma.EmployeeCreateInput, tx?: Prisma.TransactionClient): Promise<Employee>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Employee | null>;
  findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<Employee | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<Employee[]>;
  update(id: string, data: Prisma.EmployeeUpdateInput, tx?: Prisma.TransactionClient): Promise<Employee>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Employee>;
}
