import "client-only";

import callApiClient from "@/shared/lib/api/callApi.client";
import { createImageService } from "./image.services";
import { createImageApi } from "./image.api";

export const imageService = createImageService(createImageApi(callApiClient));