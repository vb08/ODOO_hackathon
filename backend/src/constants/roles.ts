/**
 * Standard system role codes.
 * Matches the seeding configurations and database expectations.
 */
export enum RoleCode {
  ADMIN = "ADMIN",
  ESG_MANAGER = "ESG_MANAGER",
  DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
  EMPLOYEE = "EMPLOYEE",
}

/**
 * Standard HTTP Status Codes for consistent response tracking.
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}
