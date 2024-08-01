import { ArgumentsHost, Catch, BadRequestException } from '@nestjs/common';

import { GqlExceptionFilter } from '@nestjs/graphql';
@Catch(BadRequestException)
export class GQLErrorFilter implements GqlExceptionFilter {
  catch(exception: BadRequestException) {
    const response = exception.getResponse();

    if (typeof response === 'object') {
      // Directly throw ApolloError with the response object.
      throw new Error(`Validation error ${response} `);
    } else {
      throw new Error('Bad Request');
    }
  }
}
