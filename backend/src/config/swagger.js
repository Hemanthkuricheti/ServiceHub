import swaggerJsdoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Service Provider Onboarding Portal API',
    version: '1.0.0',
    description:
      'REST API for a Service Provider Onboarding Portal: providers register, complete their profile, upload verification documents, and submit for admin review; admins search/filter, view documents, and approve or reject applications.\n\n' +
      'Authenticate by calling **Login** (or **Register** / **Google Sign-In**), copying the returned `token`, then clicking **Authorize** above and pasting it in as a Bearer token.',
  },
  servers: [{ url: '/api', description: 'Relative to this server' }],
  tags: [
    { name: 'Auth', description: 'Registration, login, and current-user lookup' },
    { name: 'Provider', description: 'A provider managing their own profile, documents, and application' },
    { name: 'Admin', description: 'Admin review of provider applications' },
    { name: 'Notifications', description: 'In-app notifications for both providers and admins' },
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
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
          errors: { type: 'array', items: { type: 'object' }, example: [] },
        },
      },
      Location: {
        type: 'object',
        properties: {
          address: { type: 'string', example: '12 MG Road' },
          city: { type: 'string', example: 'Bengaluru' },
          state: { type: 'string', example: 'Karnataka' },
          pincode: { type: 'string', example: '560001' },
        },
      },
      Document: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          type: { type: 'string', example: 'aadharCard' },
          name: { type: 'string', example: 'aadhar.pdf' },
          fileUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1/servicehub/documents/abc123.pdf' },
          uploadedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProviderProfile: {
        type: 'object',
        properties: {
          bio: { type: 'string' },
          categories: { type: 'array', items: { type: 'string' }, example: ['Plumbing', 'Electrical'] },
          skills: { type: 'array', items: { type: 'string' }, example: ['Pipe Fitting', 'Wiring'] },
          experienceYears: { type: 'number', example: 5 },
          location: { $ref: '#/components/schemas/Location' },
          profilePhoto: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1/servicehub/profile-photos/xyz789.jpg' },
          documents: { type: 'array', items: { $ref: '#/components/schemas/Document' } },
          status: {
            type: 'string',
            enum: ['incomplete', 'pending', 'approved', 'rejected'],
          },
          rejectionRemarks: { type: 'string' },
          submittedAt: { type: 'string', format: 'date-time', nullable: true },
          reviewedAt: { type: 'string', format: 'date-time', nullable: true },
          canEditSkillsAndExperience: { type: 'boolean' },
          skillsEditableFrom: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Jane Provider' },
          email: { type: 'string', example: 'jane@example.com' },
          phone: { type: 'string', example: '9876543210' },
          role: { type: 'string', enum: ['provider', 'admin'] },
          providerProfile: { $ref: '#/components/schemas/ProviderProfile' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          recipient: { type: 'string' },
          type: {
            type: 'string',
            enum: ['application_submitted', 'application_approved', 'application_rejected'],
          },
          message: { type: 'string' },
          link: { type: 'string', example: '/dashboard/status' },
          read: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition,
  apis: ['./src/routes/*.js'],
});
