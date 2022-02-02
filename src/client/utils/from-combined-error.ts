import type { GraphQLError } from "graphql";
import { NotImplementedError, NotFoundError, ValidationError, AlreadyExistsError } from "@/domain";
import { AuthorizationError } from "@/client/utils";


export interface GraphQLCombinedError extends Error {
  networkError?: Error,
  graphQLErrors?: GraphQLError[]
}


export function fromCombinedError(error: GraphQLCombinedError) : Error {
  const originalError = error?.graphQLErrors?.[0]?.originalError;
  if (!originalError) return error;

  // @ts-ignore
  const { name, ...extensions } = originalError?.extensions ?? {};

  switch (name) {
    case NotImplementedError.name:
      return new NotImplementedError(originalError.message);
    case NotFoundError.name:
      return new NotFoundError(originalError.message);
    case ValidationError.name:
      return new ValidationError(
        originalError.message,
        // @ts-ignore
        extensions.path,
        // @ts-ignore
        extensions.expected,
        // @ts-ignore
        extensions.received
      );
    case AlreadyExistsError.name:
      return new AlreadyExistsError(originalError.message);
    case AuthorizationError.name:
      return new AuthorizationError(originalError.message);
    default:
      return error;
  };
}