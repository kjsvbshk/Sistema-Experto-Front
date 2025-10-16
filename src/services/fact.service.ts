import type { Fact } from "../components/rule-agent";
import { api } from "./api";
import type { ApiResponse } from "./api";

export interface CreateFactRequest {
    code: string;
    description: string;
}

export interface UpdateFactRequest {
    code?: string;
    description?: string;
}

class FactService {
    // Crear hecho
    async createFact(
        factData: CreateFactRequest
    ): Promise<ApiResponse<Fact>> {
        return await api.post<Fact>("/facts", factData);
    }

    // Obtener todos los hechos
    async getAllFacts(): Promise<Fact[]> {
        const response = await api.get<Fact[]>("/facts");
        return response;
    }

    // Obtener hecho por ID
    async getFactById(factId: number): Promise<ApiResponse<Fact>> {
        return await api.get<Fact>(`/facts/${factId}`);
    }

    // Actualizar hecho
    async updateFact(
        factId: number,
        factData: UpdateFactRequest
    ): Promise<ApiResponse<Fact>> {
        return await api.put<Fact>(`/facts/${factId}`, factData);
    }

    // Eliminar hecho
    async deleteFact(factId: number): Promise<ApiResponse<void>> {
        return await api.delete<void>(`/facts/${factId}`);
    }
}

export const factService = new FactService();
