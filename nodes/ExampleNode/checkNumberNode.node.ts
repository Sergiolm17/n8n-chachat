import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class checkNumberNode implements INodeType {
  description:  INodeTypeDescription = {
    displayName: 'CHACHAT Check Number Node',
    name: 'checkNumberNode',
    group: ['transform'],
    version: 1,
    description: 'Node for validating if a phone number works',
    defaults: {
      name: 'Check Number Node',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'chatApiCredentialsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Validation Session',
        name: 'validationSession',
        type: 'string',
        default: 'im-local',
        placeholder: 'Placeholder value',
        description: 'The session for the validation API',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        placeholder: 'Placeholder value',
        description: 'The phone number to be validated',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('chatApiCredentialsApi');
    const baseURL = credentials.baseURL as string + '/v1/checkNumber';
    const token = credentials.token as string;

    let item: INodeExecutionData;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        item = items[itemIndex];

        const validationSession = this.getNodeParameter('validationSession', itemIndex, 'im-local') as string;
        const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex, '') as string;

        const headers = { Authorization: `Bearer ${token}` };

        const data = { session: validationSession, phoneNumber,
        };

        const response = await axios.post(baseURL, data, { headers });

        // Return the response data for successful requests
        return this.prepareOutputData([{ json: response.data }]);
      } catch (error) {
        if (this.continueOnFail()) { // Return the error data for failed requests return this.prepareOutputData([{ json: { error: error.message } }]);
        } else { if (error.context) {   error.context.itemIndex = itemIndex;   throw error; } throw new NodeOperationError(this.getNode(), error, {   itemIndex, });
        }
      }
    }

    return this.prepareOutputData(items);
  }
}
