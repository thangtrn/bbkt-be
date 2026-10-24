const ERROR_FIELDS = ['error', 'errorMessage'];

export type NetworkErrorOptions = { response: Response; responseData: unknown };

export class NetworkError extends Error {
  response: Response;
  responseData: unknown;

  constructor(message: string, options: NetworkErrorOptions) {
    super(message);
    this.response = options.response;
    this.responseData = options.responseData;
  }
}

export async function fetchWithError(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const responseData = await parseResponse(response);
    const message = getErrorMessage(responseData);

    // console.dir(responseData, { depth: null });

    throw new NetworkError(message ?? response.statusText, {
      response,
      responseData,
    });
  }

  return response;
}

export async function parseResponse(response: Response): Promise<any> {
  if (!response.body) {
    return '';
  }

  const data = await response.text();

  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function getErrorMessage(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    // return 'Unable to determine error message.';
    return null;
  }

  for (const key of ERROR_FIELDS) {
    const value = (data as Record<string, unknown>)[key];

    if (typeof value === 'string') {
      return value;
    }
  }

  return 'Network response was not OK.';
}
