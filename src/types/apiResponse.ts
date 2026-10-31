export interface ApiValidationError {
  propertyName: string;
  errorMessage: string;
  attemptedValue: unknown;
  customState: unknown;
  severity: number;
  errorCode: string;
  formattedMessagePlaceholderValues: Record<string, unknown>;
}


export interface ApiResponse<T> {
    data: T;
    isSuccess: boolean;
    message: string;
    error: ApiValidationError[] | null;
}