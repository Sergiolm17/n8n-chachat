import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class ProductCreateNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CHACHAT Product Create Node',
		name: 'productCreateNode',
		group: ['transform'],
		version: 1,
		description: 'Node for creating a product',
		defaults: {
			name: 'Product Create Node',
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
				displayName: 'Product Name',
				name: 'productName',
				type: 'string',
				default: 'Producto de prueba',
				placeholder: 'Placeholder value',
				description: 'The name of the product',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'PEN',
				placeholder: 'Placeholder value',
				description: 'The currency of the product',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: 'Descripción de prueba',
				placeholder: 'Placeholder value',
				description: 'The description of the product',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				default: 100,
				placeholder: 'Placeholder value',
				description: 'The price of the product',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: 'https://www.google.com',
				placeholder: 'Placeholder value',
				description: 'The URL of the product',
			},
			{
				displayName: 'Is Hidden',
				name: 'isHidden',
				type: 'boolean',
				default: false,
				placeholder: 'Placeholder value',
				description: 'Whether the product is hidden or not',
			},
			{
				displayName: 'Retailer ID',
				name: 'retailerId',
				type: 'string',
				default: '123456789',
				placeholder: 'Placeholder value',
				description: 'The retailer ID of the product',
			},
			{
				displayName: 'Origin Country Code',
				name: 'originCountryCode',
				type: 'string',
				default: 'PE',
				placeholder: 'Placeholder value',
				description: 'The origin country code of the product',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				default:
					'https://cdn.discordapp.com/attachments/942926206033080361/1165452529618923641/Imagen_de_WhatsApp_2023-10-21_a_las_15.15.00_0d964899.jpg?ex=656bd140&is=65595c40&hm=7fe26da7d8c743d4a530f020a2a11ac3d8c2ec4804e955159a7a43a53c6a033f&',
				placeholder: 'Placeholder value',
				description: 'The URL of the product image',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('chatApiCredentialsApi');
		const baseURL = (credentials.baseURL as string) + '/v1/productCreate';
		const token = credentials.token as string;
		const chatSession = credentials.session as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const productName = this.getNodeParameter('productName', itemIndex, '') as string;
				const currency = this.getNodeParameter('currency', itemIndex, '') as string;
				const description = this.getNodeParameter('description', itemIndex, '') as string;
				const price = this.getNodeParameter('price', itemIndex, 0) as number;
				const url = this.getNodeParameter('url', itemIndex, '') as string;
				const isHidden = this.getNodeParameter('isHidden', itemIndex, false) as boolean;
				const retailerId = this.getNodeParameter('retailerId', itemIndex, '') as string;
				const originCountryCode = this.getNodeParameter(
					'originCountryCode',
					itemIndex,
					'',
				) as string;
				const imageUrl = this.getNodeParameter('imageUrl', itemIndex, '') as string;

				const headers = { Authorization: `Bearer ${token}` };

				const data = {
					session: chatSession,
					product: {
						name: productName,
						currency,
						description,
						price,
						url,
						isHidden,
						retailerId,
						originCountryCode,
						images: [{ url: imageUrl }],
					},
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
