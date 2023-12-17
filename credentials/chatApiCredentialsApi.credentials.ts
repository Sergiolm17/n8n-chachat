import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class chatApiCredentialsApi implements ICredentialType {
	name = 'chatApiCredentialsApi';
	displayName = 'Credentials API';
	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'Base URL',
			name: 'baseURL',
			type: 'string',
			default: '',
			typeOptions: { password: false },
		},
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			default: '',
			typeOptions: { password: true },
		},
	];
}
