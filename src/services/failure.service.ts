import type { Failure } from "../components/rule-agent";
import { api } from "./api";
import type { ApiResponse } from "./api";

export interface CreateFailureRequest {
    name: string;
    description?: string;
}

export interface UpdateFailureRequest {
    name?: string;
    description?: string;
}

class FailureService {
    // Crear falla
    async createFailure(
        failureData: CreateFailureRequest
    ): Promise<ApiResponse<Failure>> {
        return await api.post<Failure>("/failures", failureData);
    }

    // Obtener todas las fallas
    async getAllFailures(): Promise<ApiResponse<Failure[]>> {
        return await api.get<Failure[]>("/failures");
    }

    // Obtener falla por ID
    async getFailureById(failureId: number): Promise<ApiResponse<Failure>> {
        return await api.get<Failure>(`/failures/${failureId}`);
    }

    // Actualizar falla
    async updateFailure(
        failureId: number,
        failureData: UpdateFailureRequest
    ): Promise<ApiResponse<Failure>> {
        return await api.put<Failure>(`/failures/${failureId}`, failureData);
    }

    // Eliminar falla
    async deleteFailure(failureId: number): Promise<ApiResponse<void>> {
        return await api.delete<void>(`/failures/${failureId}`);
    }
}

export const failureService = new FailureService();
