export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
}

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
