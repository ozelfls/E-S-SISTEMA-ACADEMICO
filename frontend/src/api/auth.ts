import api from './client'
import type { ApiResponse, LoginResponse } from '../types'

export interface LoginPayload {
  login: string
  senha: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  return data.data
}
