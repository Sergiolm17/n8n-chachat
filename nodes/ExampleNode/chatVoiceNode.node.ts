import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class chatVoiceNode implements INodeType {
  description:  INodeTypeDescription = {
    displayName: 'CHACHAT Chat Voice Node',
    name: 'chatVoiceNode',
    group: ['transform'],
    version: 1,
    description: 'Node for sending voice messages via Chat API',
    defaults: {
      name: 'Chat Voice Node',
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
        displayName: 'Voice URL',
        name: 'voiceUrl',
        type: 'string',
        default: '',
        placeholder: 'Placeholder value',
        description: 'The URL of the voice message for the Chat API',
      },
      {
        displayName: 'MIME Type',
        name: 'mimeType',
        type: 'string',
        default: 'audio/mp4',
        placeholder: 'Placeholder value',
        description: 'The MIME type of the voice message for the Chat API',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('chatApiCredentialsApi');
    const baseURL = credentials.baseURL as string + '/v1/send/voice';
    const token = credentials.token as string;

    let item: INodeExecutionData;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        item = items[itemIndex];

        const chatSession = this.getNodeParameter('chatSession', itemIndex, 'im') as string;
        const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex, '') as string;
        const voiceUrl = this.getNodeParameter('voiceUrl', itemIndex, '') as string;
        const mimeType = this.getNodeParameter('mimeType', itemIndex, 'audio/mp4') as string;

        const headers = { Authorization: `Bearer ${token}` };

        const data = { session: chatSession, phoneNumber, url: voiceUrl, mimetype: mimeType,
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
