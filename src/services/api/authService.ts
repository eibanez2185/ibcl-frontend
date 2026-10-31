import { apiClient } from "./apiClient";

import type { ApiResponse } from "@/types/apiResponse";
import type { LoginRequest, LoginResponse } from "@/types/auth";

async function login(
  request: LoginRequest,
): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post<ApiResponse<LoginResponse>>(
    "/Auth/LoginAsync",
    request,
    { invalidateSessionOnUnauthorized: false },
  );
}

export const authService = {
  login,
};