import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class chatTextNode implements INodeType {
  description:  INodeTypeDescription = {
    displayName: 'CHACHAT Chat Text Node',
    name: 'chatTextNode',
    group: ['transform'],
    version: 1,
    description: 'Node for sending text messages via Chat API',
    defaults: {
      name: 'Chat Text Node',
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
        displayName: 'Chat Session',
        name: 'chatSession',
        type: 'string',
        default: 'im',
        placeholder: 'Placeholder value',
        description: 'The session for the Chat API',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        placeholder: 'Placeholder value',
        description: 'The phone number for the Chat API',
      },
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        default: '',
        placeholder: 'Placeholder value',
        description: 'The text message for the Chat API',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('chatApiCredentialsApi');
    const baseURL = credentials.baseURL as string + '/v1/send/text';
    const token = credentials.token as string;

    let item: INodeExecutionData;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        item = items[itemIndex];

        const chatSession = this.getNodeParameter('chatSession', itemIndex, 'im') as string;
        const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex, '') as string;
        const text = this.getNodeParameter('text', itemIndex, '') as string;

        const headers = { Authorization: `Bearer ${token}`,
        };

        const data = { session: chatSession, phoneNumber, text,
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
