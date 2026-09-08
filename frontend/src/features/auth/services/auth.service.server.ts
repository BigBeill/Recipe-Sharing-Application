import "server-only";

import { createAuthService } from "./auth.service";
import { createAuthApi } from "./auth.api";
import callApiServer from "@/shared/lib/api/callApi.server";

export const authService = createAuthService(createAuthApi(callApiServer));