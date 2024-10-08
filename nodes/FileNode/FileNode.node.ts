import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class FileNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CHACHAT Chat File Node',
		name: 'fileNode',
		group: ['transform'],
		version: 1,
		description: 'Node for sending File messages via Chat API',
		defaults: {
			name: 'Chat File Node',
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
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The URL of the file message for the Chat API',
			},
			{
				displayName: 'MIME Type',
				name: 'mimeType',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The MIME type of the file message for the Chat API',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('chatApiCredentialsApi');
		const baseURL = (credentials.baseURL as string) + '/v1/send/file';
		const token = credentials.token as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex, '') as string;
				const fileUrl = this.getNodeParameter('fileUrl', itemIndex, '') as string;
				const mimeType = this.getNodeParameter('mimeType', itemIndex, '') as string;

				let data = JSON.stringify({
					jid: phoneNumber,
					type: 'number',
					message: {
						fileName: 'documento.pdf',
						mimetype: mimeType,
						document: {
							url: fileUrl,
						},
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
