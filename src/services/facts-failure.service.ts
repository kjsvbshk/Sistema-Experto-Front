import { api } from "./api";
import type { ApiResponse } from "./api";

export interface FactsFailure {
    id: number;
    fact_id: number;
    failure_id: number;
    fact: {
        id: number;
        code: string;
        description: string;
    };
    failure: {
        id: number;
        name: string;
        description?: string;
    };
}

export interface CreateFactsFailureRequest {
    fact_id: number;
    failure_id: number;
}

export interface UpdateFactsFailureRequest {
    fact_id?: number;
    failure_id?: number;
}

class FactsFailureService {
    // Crear relación hecho-falla
    async createRelation(
        relationData: CreateFactsFailureRequest
    ): Promise<ApiResponse<FactsFailure>> {
        return await api.post<FactsFailure>("/facts-failure", relationData);
    }

    // Obtener todas las relaciones
    async getAllRelations(): Promise<FactsFailure[]> {
        const response = await api.get<FactsFailure[]>("/facts-failure");
        return response;
    }

    // Obtener relaciones por hecho
    async getRelationsByFact(factId: number): Promise<FactsFailure[]> {
        const response = await api.get<FactsFailure[]>(`/facts-failure/fact/${factId}`);
        return response;
    }

    // Obtener relaciones por falla
    async getRelationsByFailure(failureId: number): Promise<FactsFailure[]> {
        const response = await api.get<FactsFailure[]>(`/facts-failure/failure/${failureId}`);
        return response;
    }

    // Obtener relación por ID
    async getRelationById(relationId: number): Promise<ApiResponse<FactsFailure>> {
        return await api.get<FactsFailure>(`/facts-failure/${relationId}`);
    }

    // Actualizar relación
    async updateRelation(
        relationId: number,
        relationData: UpdateFactsFailureRequest
    ): Promise<ApiResponse<FactsFailure>> {
        return await api.put<FactsFailure>(`/facts-failure/${relationId}`, relationData);
    }

    // Eliminar relación
    async deleteRelation(relationId: number): Promise<ApiResponse<void>> {
        return await api.delete<void>(`/facts-failure/${relationId}`);
    }
}

export const factsFailureService = new FactsFailureService();