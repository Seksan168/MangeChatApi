import { verifyToken } from '../../utils/jwt';

interface AuthHeaders {
  authorization?: string;
}

interface AuthSet {
  status: number;
}

interface AuthStore {
  user?: any;
}

export const authMiddleware = () => async ({
  headers,
  set,
  store,
}: {
  headers: AuthHeaders;
  set: AuthSet;
  store: AuthStore;
}) => {
  const auth = headers.authorization;
  if (!auth) {
    set.status = 401;
    return { error: 'No token provided' };
  }

  try {
    const payload = verifyToken(auth.split(' ')[1]);
    store.user = payload;
  } catch {
    set.status = 401;
    return { error: 'Invalid token' };
  }
};
