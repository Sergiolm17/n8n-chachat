import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class TextNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CHACHAT Chat Text Node',
		name: 'textNode',
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

		const baseURL = (credentials.baseURL as string) + '/v1/send/text';
		const token = credentials.token as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex, '') as string;
				const text = this.getNodeParameter('text', itemIndex, '') as string;

				let data = JSON.stringify({
					jid: phoneNumber,
					type: 'number',
					message: {
						text,
					},
				});

				const response = await axios.request({
					method: 'post',
					maxBodyLength: Infinity,
					url: baseURL + '/messages/send',
					headers: {
						'Content-Type': 'application/json',
						'x-api-key': token,
					},
					data: data,
				});

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
