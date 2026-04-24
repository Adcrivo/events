import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';
import dotenv from 'dotenv';
import { logInfo, logError } from '../utils/logger';

export const loadSecrets = async (): Promise<void> => {
  const env = process.env.NODE_ENV || 'development';

  // 1. Local Development: Just use dotenv
  if (env === 'development' || env === 'test' || env === 'dev') {
    dotenv.config();
    logInfo('Loaded secrets from .env file');
    return;
  }

  // 2. Production: Fetch from AWS SSM
  logInfo(`Fetching secrets from SSM for environment: ${env}`);
  const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'ap-south-1' });

  // Paths to fetch from
  const paths = [
    `/adcrivo-events/${env}/`,
    `/adcrivo-db/${env}/`
  ];

  try {
    for (const path of paths) {
      const command = new GetParametersByPathCommand({
        Path: path,
        WithDecryption: true,
        Recursive: true
      });

      const response = await ssmClient.send(command);
      
      if (response.Parameters) {
        response.Parameters.forEach(param => {
          if (param.Name && param.Value) {
            // Extract the key name (e.g., /adcrivo-events/prod/PORT -> PORT)
            const parts = param.Name.split('/');
            const key = parts[parts.length - 1].toUpperCase();
            
            process.env[key] = param.Value;
            logInfo(`Loaded secret: ${key}`);
          }
        });
      }
    }

    // Validation
    if (!process.env.DATABASE_URL) {
      logError('CRITICAL: DATABASE_URL not found in SSM');
      throw new Error('DATABASE_URL is required');
    }

    logInfo('All secrets loaded successfully from SSM');
  } catch (error) {
    logError(`Failed to load secrets from SSM: ${error}`);
    throw error;
  }
};
