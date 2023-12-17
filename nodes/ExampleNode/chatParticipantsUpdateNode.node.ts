import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class chatParticipantsUpdateNode implements INodeType {
  description:  INodeTypeDescription = {
    displayName: 'CHACHAT Chat Participants Update Node',
    name: 'chatParticipantsUpdateNode',
    group: ['transform'],
    version: 1,
    description: 'Node for updating participants in a chat via Chat API',
    defaults: {
      name: 'Chat Participants Update Node',
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
        displayName: 'Group ID',
        name: 'groupId',
        type: 'string',
        default: '',
        placeholder: 'Placeholder value',
        description: 'The ID of the group for updating participants',
      },
      {
        displayName: 'Participants',
        name: 'participants',
        type: 'string[]',
        default: [],
        placeholder: 'Placeholder value',
        description: 'An array of phone numbers for the participants',
      },
      {
        displayName: 'Action',
        name: 'action',
        type: 'options',
        options: [ {   name: 'Promote',   value: 'promote', }, {   name: 'Demote',   value: 'demote', }, {   name: 'Remove',   value: 'remove', }, {   name: 'Add',   value: 'add', },
        ],
        default: 'promote',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('chatApiCredentialsApi');
    const baseURL = credentials.baseURL as string + '/v1/updateParticipants';
    const token = credentials.token as string;

    let item: INodeExecutionData;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        item = items[itemIndex];

        const chatSession = this.getNodeParameter('chatSession', itemIndex, 'im') as string;
        const groupId = this.getNodeParameter('groupId', itemIndex, '') as string;
        const participants = this.getNodeParameter('participants', itemIndex, []) as string[];
        const action = this.getNodeParameter('action', itemIndex, 'promote') as string;

        const headers = { Authorization: `Bearer ${token}` };

        const data = { session: chatSession, groupId, participants, action,
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
