import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class CreateGroupNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CHACHAT Create Group Node',
		name: 'createGroupNode',
		group: ['transform'],
		version: 1,
		description: 'Node for creating a group via API',
		defaults: {
			name: 'Create Group Node',
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
			displayName: 'Participants',
			name: 'participants',
			default: {},
			required: true,
			description: 'An array of phone numbers for participants in the group',
			options: [
				{
					name: 'phoneNumbers',
					displayName: 'PhoneNumber',
					values: [
						{
							displayName: 'phoneNumber',
							name: 'phoneNumber',
							type: 'string',
							default: '',
							required: true,
							description: 'Value of query parameter',
						},
					],
				},
			],
			type: 'fixedCollection',
			typeOptions: {
				multipleValues: true,
			},
			},
			{
				displayName: 'Group Name',
				name: 'groupName',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The name of the group',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('chatApiCredentialsApi');
		const baseURL = (credentials.baseURL as string) + '/v1/createGroup';
		const token = credentials.token as string;
		const chatSession = credentials.session as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const participants = this.getNodeParameter('participants', itemIndex, []) as { phoneNumbers: { phoneNumber: string }[] };
				const phoneNumber = participants.phoneNumbers.map((item) => item.phoneNumber);
				const groupName = this.getNodeParameter('groupName', itemIndex, '') as string;

				const headers = { Authorization: `Bearer ${token}` };

				const data = { session: chatSession, participants:phoneNumber, name: groupName };
				console.log(data);

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
