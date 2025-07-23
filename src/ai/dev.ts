// This file is used for local development of Genkit.
// It is not intended for production use.
import {getFlows} from '@genkit-ai/next/plugin';

export default {
  name: 'default',
  flows: await getFlows(),
};
