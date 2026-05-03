export interface jwtPayload {
  id: string;
  type?: 'access' | 'refresh';
  iat: number;
  exp?: number;
}
