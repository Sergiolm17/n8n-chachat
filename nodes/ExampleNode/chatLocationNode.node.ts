import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class chatLocationNode implements INodeType {
  description:  INodeTypeDescription = {
    displayName: 'CHACHAT Chat Location Node',
    name: 'chatLocationNode',
    group: ['transform'],
    version: 1,
    description: 'Node for sending location data via Chat API',
    defaults: {
      name: 'Chat Location Node',
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
        default: 'im-local',
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
        displayName: 'Latitude',
        name: 'latitude',
        type: 'number',
        default: 0,
        placeholder: 'Placeholder value',
        description: 'The latitude for the location data',
      },
      {
        displayName: 'Longitude',
        name: 'longitude',
        type: 'number',
        default: 0,
        placeholder: 'Placeholder value',
        description: 'The longitude for the location data',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        placeholder: 'Placeholder value',
        description: 'The address for the location data',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('chatApiCredentialsApi');
    const baseURL = credentials.baseURL as string + '/v1/send/location';
    const token = credentials.token as string;

    let item: INodeExecutionData;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        item = items[itemIndex];

        const chatSession = this.getNodeParameter('chatSession', itemIndex, 'im-local') as string;
        const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex, '') as string;
        const latitude = this.getNodeParameter('latitude', itemIndex, 0) as number;
        const longitude = this.getNodeParameter('longitude', itemIndex, 0) as number;
        const address = this.getNodeParameter('address', itemIndex, '') as string;

        const headers = { Authorization: `Bearer ${token}` };

        const data = { session: chatSession, phoneNumber, latitude, longitude, address,
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
