import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/api/authService";
import { useAuth } from "@/auth/AuthProvider";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import type { ApiResponse, ApiValidationError } from "@/types/apiResponse";
import { ApiError } from "@/services/api/apiClient";


export class LoginError extends Error {
  validationErrors: ApiValidationError[] | null;

  constructor(
    message: string,
    validationErrors: ApiValidationError[] | null = null,
  ) {
    super(message);
    this.name = "LoginError";
    this.validationErrors = validationErrors;
  }
}

export function useLogin() {
    const { setAuth } = useAuth();

  return useMutation<
    ApiResponse<LoginResponse>,
    LoginError,
    LoginRequest
  >({
    mutationFn: async (request: LoginRequest) => {
      try {
        const response = await authService.login(request);

        if (!response.isSuccess) {
          throw new LoginError(response.message, response.error);
        }

        setAuth(response.data);

        return response;

      } catch (error) {
        if (error instanceof ApiError) {
          const response = error.data as ApiResponse<LoginResponse>;

          throw new LoginError(response.message, response.error);
        }

        throw error;
      }
    },
  });
}