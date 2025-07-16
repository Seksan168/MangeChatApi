import { Elysia } from 'elysia';
import bcrypt from 'bcryptjs';
import { userModel } from '../models/userModel';
import { generateToken } from '../../utils/jwt';

type RegisterBody = {
  username: string;
  email: string;
  password: string;
};

type LoginBody = {
  email: string;
  password: string;
};

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body, set }: { body: RegisterBody; set: any }) => {
    const { username, email, password } = body;

    const exists = await userModel.findByEmail(email);
    if (exists) {
      set.status = 400;
      return { error: 'Email already registered' };
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      email,
      password: hashed,
      role: 'user',
    });

    set.status = 201;

    return {
      message: 'Register success',
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  })
  .post('/login', async ({ body, set }: { body: LoginBody; set: any }) => {
    const { email, password } = body;
    const user = await userModel.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      set.status = 401;
      return { error: 'Invalid credentials' };
    }

    const token = generateToken({ id: user.id, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  });