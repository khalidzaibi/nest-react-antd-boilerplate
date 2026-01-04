// src/common/filters/validation-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, BadRequestException } from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const res = exception.getResponse() as any;

    if (Array.isArray(res.message)) {
      const fieldErrors: Record<string, string> = {};

      res.message.forEach((msg: string) => {
        const field = msg.split(' ')[0];
        if (!fieldErrors[field]) {
          fieldErrors[field] = msg.charAt(0).toUpperCase() + msg.slice(1);
        }
      });

      // Count errors for a user-friendly summary
      const errorCount = res.message.length;
      const msg = res.message[0].charAt(0).toUpperCase() + res.message[0].slice(1);
      const summaryMessage =
        errorCount === 1 ? msg  : `${msg} and ${errorCount - 1} other${errorCount > 2 ? 's' : ''}`;

      return response.status(400).json({
        statusCode: 400,
        message: summaryMessage, //  summary message
        errors: fieldErrors,     //  per-field messages
      });
    }

    return response.status(400).json({
      statusCode: 400,
      message: res.message || 'Validation failed',
    });
  }
}
