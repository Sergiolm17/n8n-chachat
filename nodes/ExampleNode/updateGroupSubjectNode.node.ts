import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class updateGroupSubjectNode implements INodeType {
  description:  INodeTypeDescription = {
    displayName: 'CHACHAT Update Group Subject Node',
    name: 'updateGroupSubjectNode',
    group: ['transform'],
    version: 1,
    description: 'Node for updating the subject of a group via Chat API',
    defaults: {
      name: 'Update Group Subject Node',
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
        displayName: 'Group ID',
        name: 'groupId',
        type: 'string',
        default: '',
        placeholder: 'Placeholder value',
        description: 'The ID of the group to update',
      },
      {
        displayName: 'New Subject',
        name: 'newSubject',
        type: 'string',
        default: '',
        placeholder: 'Placeholder value',
        description: 'The new subject for the group',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('chatApiCredentialsApi');
    const baseURL = credentials.baseURL as string + '/v1/updateGroupSubject';
    const token = credentials.token as string;
    const chatSession = credentials.session as string;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const groupId = this.getNodeParameter('groupId', itemIndex, '') as string;
        const newSubject = this.getNodeParameter('newSubject', itemIndex, '') as string;

        const headers = { Authorization: `Bearer ${token}` };

        const data = { session: chatSession, groupId, newSubject,
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
