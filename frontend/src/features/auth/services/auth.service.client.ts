import "client-only";

import { createAuthService } from "./auth.service";
import { createAuthApi } from "./auth.api";
import callApiClient from "@/shared/lib/api/callApi.client";

export const authService = createAuthService(createAuthApi(callApiClient));

