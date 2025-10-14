import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Happimobi - API de Reserva de Veículos',
    version: '1.0.0',
    description:
      'API REST para gerenciamento de usuários, veículos e reservas. Todas as rotas (exceto /login) exigem autenticação via Bearer token. Documentação e testes fazem parte do teste técnico de Fábio Garbato.',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor atual',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '68ed8ed6fb3a96ea9fb41002' },
          name: { type: 'string', example: 'Administrador' },
          email: { type: 'string', example: 'admin@testetecnico.com' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Fulano' },
          email: { type: 'string', example: 'fulano@teste.com' },
          password: { type: 'string', example: 'Senha123' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Fulano Atualizado' },
          email: { type: 'string', example: 'fulano@teste.com' },
          password: { type: 'string', example: 'Senha123' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@testeTecnicoFabio.com' },
          password: { type: 'string', example: 'T3st$.!@H4ppy' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          details: {},
        },
      },
      Vehicle: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64b8f94c7d3c1a0012123456' },
          name: { type: 'string', example: 'Onix LT 1.0' },
          brand: { type: 'string', example: 'Chevrolet' },
          modelName: { type: 'string', example: 'Hatch' },
          year: { type: 'integer', example: 2024 },
          licensePlate: { type: 'string', example: 'ABC1D23' },
          color: { type: 'string', example: 'Branco' },
          type: { type: 'string', example: 'Hatch' },
          engine: { type: 'string', example: '1.0 Turbo' },
          size: { type: 'integer', example: 5 },
          status: { type: 'string', enum: ['available', 'reserved'], example: 'available' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateVehicleRequest: {
        type: 'object',
        required: ['name', 'brand', 'modelName', 'year', 'licensePlate'],
        properties: {
          name: { type: 'string', example: 'Onix LT 1.0' },
          brand: { type: 'string', example: 'Chevrolet' },
          modelName: { type: 'string', example: 'Hatch' },
          year: { type: 'integer', example: 2024 },
          licensePlate: { type: 'string', example: 'ABC1D23' },
          color: { type: 'string', example: 'Branco' },
          type: { type: 'string', example: 'Hatch' },
          engine: { type: 'string', example: '1.0 Turbo' },
          size: { type: 'integer', example: 5 },
        },
      },
      UpdateVehicleRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Onix LT 1.0 Turbo' },
          brand: { type: 'string', example: 'Chevrolet' },
          modelName: { type: 'string', example: 'Hatch' },
          year: { type: 'integer', example: 2025 },
          licensePlate: { type: 'string', example: 'ABC1D23' },
          color: { type: 'string', example: 'Vermelho' },
          type: { type: 'string', example: 'SUV' },
          engine: { type: 'string', example: '2.0' },
          size: { type: 'integer', example: 7 },
        },
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64b8f94c7d3c1a0012129999' },
          status: { type: 'string', enum: ['active', 'released'], example: 'active' },
          reservedAt: { type: 'string', format: 'date-time' },
          releasedAt: { type: 'string', format: 'date-time', nullable: true },
          vehicle: { $ref: '#/components/schemas/Vehicle' },
        },
      },
      ReserveVehicleRequest: {
        type: 'object',
        required: ['vehicleId'],
        properties: {
          vehicleId: { type: 'string', example: '64b8f94c7d3c1a0012123456' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Realiza login e retorna o token JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
        security: [],
      },
    },
    '/users': {
      post: {
        tags: ['Usuários'],
        summary: 'Cadastra um novo usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '400': {
            description: 'Payload inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'E-mail já cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Usuários'],
        summary: 'Lista usuários cadastrados',
        responses: {
          '200': {
            description: 'Listagem retornada',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      put: {
        tags: ['Usuários'],
        summary: 'Atualiza dados do usuário',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Usuário atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '400': {
            description: 'Payload inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Remove usuário',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': {
            description: 'Usuário removido',
          },
          '404': {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/vehicles': {
      post: {
        tags: ['Veículos'],
        summary: 'Cadastra um novo veículo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateVehicleRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Veículo criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Vehicle' },
              },
            },
          },
          '400': {
            description: 'Payload inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Placa já cadastrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Veículos'],
        summary: 'Lista veículos cadastrados',
        responses: {
          '200': {
            description: 'Listagem retornada',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Vehicle' },
                },
              },
            },
          },
        },
      },
    },
    '/vehicles/{id}': {
      put: {
        tags: ['Veículos'],
        summary: 'Atualiza dados do veículo',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateVehicleRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Veículo atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Vehicle' },
              },
            },
          },
          '400': {
            description: 'Payload inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Veículo não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Placa já cadastrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Veículos'],
        summary: 'Remove veículo',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': {
            description: 'Veículo removido',
          },
          '404': {
            description: 'Veículo não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Veículo reservado não pode ser removido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/reservations': {
      post: {
        tags: ['Reservas'],
        summary: 'Reserva um veículo para o usuário autenticado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReserveVehicleRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Reserva criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reservation' },
              },
            },
          },
          '404': {
            description: 'Veículo não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Regras de reserva violadas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/reservations/{id}/release': {
      post: {
        tags: ['Reservas'],
        summary: 'Libera um veículo reservado',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Reserva liberada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reservation' },
              },
            },
          },
          '403': {
            description: 'Reserva não pertence ao usuário',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Reserva não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Reserva já liberada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/reservations/me': {
      get: {
        tags: ['Reservas'],
        summary: 'Lista veículos reservados pelo usuário autenticado',
        responses: {
          '200': {
            description: 'Listagem retornada',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Reservation' },
                },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
