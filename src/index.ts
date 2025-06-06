import { Elysia } from "elysia";
import { authRoutes } from './routes/authRoute';
import { swagger } from '@elysiajs/swagger';


const app = new Elysia()
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Stock Management API',
          version: '1.0.0',
          description: 'REST API for stock management system built with Elysia.js',
        },
      },
    })
  )
  .use(authRoutes)
  .listen(3000);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
console.log('📘 Swagger UI at http://localhost:3000/swagger');

