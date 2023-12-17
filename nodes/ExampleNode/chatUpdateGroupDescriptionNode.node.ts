import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class chatUpdateGroupDescriptionNode implements INodeType {
  description:  INodeTypeDescription = {
    displayName: 'CHACHAT Chat Update Group Description Node',
    name: 'chatUpdateGroupDescriptionNode',
    group: ['transform'],
    version: 1,
    description: 'Node for updating group description via Chat API',
    defaults: {
      name: 'Chat Update Group Description Node',
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
        displayName: 'Group ID',
        name: 'groupId',
        type: 'string',
        default: '120363199451260803@g.us',
        placeholder: 'Placeholder value',
        description: 'The ID of the group for updating the description',
      },
      {
        displayName: 'New Description',
        name: 'newDescription',
        type: 'string',
        default: 'Cambio de descripción',
        placeholder: 'Placeholder value',
        description: 'The new description for the group',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('chatApiCredentialsApi');
    const baseURL = credentials.baseURL as string + '/v1/updateGroupDescription';
    const token = credentials.token as string;

    let item: INodeExecutionData;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        item = items[itemIndex];

        const chatSession = this.getNodeParameter('chatSession', itemIndex, 'im-local') as string;
        const groupId = this.getNodeParameter('groupId', itemIndex, '120363199451260803@g.us') as string;
        const newDescription = this.getNodeParameter('newDescription', itemIndex, 'Cambio de descripción') as string;

        const headers = { Authorization: `Bearer ${token}` };

        const data = { session: chatSession, groupId, newDescription,
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
