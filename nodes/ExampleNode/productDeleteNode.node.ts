import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class productDeleteNode implements INodeType {
  description:  INodeTypeDescription = {
    displayName: 'CHACHAT Product Delete Node',
    name: 'productDeleteNode',
    group: ['transform'],
    version: 1,
    description: 'Node for deleting a product',
    defaults: {
      name: 'Product Delete Node',
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
        displayName: 'Product IDs',
        name: 'productIds',
        type: 'string',
        default: '',
        placeholder: 'Placeholder value',
        description: 'Comma-separated list of product IDs to delete',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('chatApiCredentialsApi');
    const baseURL = credentials.baseURL as string + '/v1/productDelete';
    const token = credentials.token as string;
    const chatSession = credentials.session as string;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const productIds = this.getNodeParameter('productIds', itemIndex, '') as string;

        const headers = { Authorization: `Bearer ${token}` };

        const data = { session: chatSession, productIds: productIds.split(',').map((id) => id.trim()), // Split and trim to handle comma-separated IDs
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
