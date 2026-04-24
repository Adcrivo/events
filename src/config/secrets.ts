import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";
import dotenv from 'dotenv';
import { logInfo, logError } from "../utils/logger";

export const loadSecrets = async () => {
  const env = process.env.NODE_ENV || 'development';

  // Load .env for local development
  if (env === 'development' || env === 'test') {
    dotenv.config();
    logInfo('Running in development mode, loaded config from .env');
    return;
  }

  const region = process.env.AWS_REGION || 'ap-south-1';
  const client = new SSMClient({ region });
  const path = `/adcrivo-events/${env}/`;

  try {
    logInfo(`Fetching secrets from SSM path: ${path}`);

    const command = new GetParametersByPathCommand({
      Path: path,
      WithDecryption: true,
      Recursive: true
    });

    const response = await client.send(command);

    if (response.Parameters) {
      response.Parameters.forEach(param => {
        if (param.Name && param.Value) {
          // Extract and format key (e.g., /adcrivo-events/prod/SQS_QUEUE_URL -> SQS_QUEUE_URL)
          const key = param.Name
            .replace(path, '')
            .replace(/\//g, '_')
            .toUpperCase();
          process.env[key] = param.Value;
          logInfo(`Loaded secret: ${key}`);
        }
      });
    }

    // Fetch DB secrets from the new unified path
    const dbPath = `/adcrivo-db/${env}/`;
    const dbCommand = new GetParametersByPathCommand({
      Path: dbPath,
      WithDecryption: true,
      Recursive: true
    });

    const dbResponse = await client.send(dbCommand);
    if (dbResponse.Parameters) {
      dbResponse.Parameters.forEach(param => {
        if (param.Name && param.Value) {
          const key = `DB_${param.Name.replace(dbPath, '').toUpperCase()}`;
          process.env[key] = param.Value;
          logInfo(`Loaded DB secret: ${key}`);
        }
      });
    }

    // Construct DATABASE_URL
    // Priority 1: Use the pre-constructed URL from SSM if available
    // Priority 2: Construct from individual components with proper encoding
    if (process.env.DB_DATABASE_URL) {
      process.env.DATABASE_URL = process.env.DB_DATABASE_URL;
      logInfo('Using DATABASE_URL from SSM');
    } else if (process.env.DB_ENDPOINT && process.env.DB_USERNAME && process.env.DB_PASSWORD && process.env.DB_NAME) {
      const host = process.env.DB_ENDPOINT.split(':')[0];
      const port = process.env.DB_PORT || '5432';
      const encodedPassword = encodeURIComponent(process.env.DB_PASSWORD);
      process.env.DATABASE_URL = `postgresql://${process.env.DB_USERNAME}:${encodedPassword}@${host}:${port}/${process.env.DB_NAME}?schema=public`;
      logInfo('Constructed DATABASE_URL from individual SSM parameters');
    }

    // Also fetch shared parameters if they exist
    const sharedPath = `/adcrivo-events/shared/`;
    const sharedCommand = new GetParametersByPathCommand({
      Path: sharedPath,
      WithDecryption: true,
      Recursive: true
    });

    const sharedResponse = await client.send(sharedCommand);
    if (sharedResponse.Parameters) {
      sharedResponse.Parameters.forEach(param => {
        if (param.Name && param.Value) {
          const key = param.Name.replace(sharedPath, '');
          // Don't overwrite environment-specific params
          if (!process.env[key]) {
            process.env[key] = param.Value;
            logInfo(`Loaded shared secret: ${key}`);
          }
        }
      });
    }

  } catch (error) {
    logError(`Error loading secrets from SSM: ${error}`);
    // In production, failing to load secrets might be fatal
    if (env === 'production') {
      throw new Error('Failed to load critical secrets from SSM');
    }
  }
};
