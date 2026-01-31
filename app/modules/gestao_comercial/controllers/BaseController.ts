import { HttpContext } from '@adonisjs/core/http';

export default abstract class BaseController {
  protected async handleRequest<T>(
    context: HttpContext,
    handler: () => Promise<T>,
    successStatus: number = 200
  ) {
    try {
      const result = await handler();
      return context.response.status(successStatus).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error:', error);
      return context.response.status(500).json({
        success: false,
        message: error.message || 'An error occurred',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}
