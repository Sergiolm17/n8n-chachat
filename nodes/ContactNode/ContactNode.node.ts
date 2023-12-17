import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class ContactNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CHACHAT Chat Contact Vcard Node',
		name: 'contactNode',
		group: ['transform'],
		version: 1,
		description: 'Node for sending contact vCard messages via Chat API',
		defaults: {
			name: 'Chat Contact Vcard Node',
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
				displayName: 'Contact Vcard',
				name: 'contactVcard',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The vCard data for the contact for the Chat API',
			},
			{
				displayName: 'Contact Name',
				name: 'contactName',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The display name for the contact for the Chat API',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('chatApiCredentialsApi');
		const baseURL = (credentials.baseURL as string) + '/v1/send/contactVcard';
		const token = credentials.token as string;
		const chatSession = credentials.session as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const contactVcard = this.getNodeParameter('contactVcard', itemIndex, '') as string;
				const contactName = this.getNodeParameter('contactName', itemIndex, '') as string;

				const headers = { Authorization: `Bearer ${token}` };

				const data = {
					session: chatSession,
					contacts: { displayName: contactName, contacts: [{ vcard: contactVcard }] },
				};

				const response = await axios.post(baseURL, data, { headers });

				// Return the response data for successful requests
				return this.prepareOutputData([{ json: response.data }]);
			} catch (error) {
				if (this.continueOnFail()) {
					// Return the error data for failed requests return this.prepareOutputData([{ json: { error: error.message } }]);
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, { itemIndex });
				}
			}
		}

		return this.prepareOutputData(items);
	}
}
