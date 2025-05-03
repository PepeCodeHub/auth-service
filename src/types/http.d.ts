export interface AuthRequest {
  action: HttpMethod;
  path: string;
  body?: any;
  headers?: any;
}

export interface AuthResponse {
  statusCode: number;
  data?: any;
}
