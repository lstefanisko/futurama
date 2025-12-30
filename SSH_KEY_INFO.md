# SSH Key Information

## Generated SSH Key

An SSH key pair has been generated for deployment purposes:

- **Private Key**: `deploy_key` (keep this secure, never commit to git)
- **Public Key**: `deploy_key.pub`

## Public Key

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPlA2/lwh32eJgsbiZ+ktb4voxOQILJBZ12SKECVBZOL futurama-deploy@lstefanisko
```

## Usage

### For GitHub Deployment

1. Copy the public key content from `deploy_key.pub`
2. Go to your GitHub repository settings
3. Navigate to "Deploy keys" section
4. Click "Add deploy key"
5. Paste the public key and give it a descriptive title
6. Check "Allow write access" if needed for deployments

### For Server Deployment

1. Copy the public key to your server:
   ```bash
   ssh-copy-id -i deploy_key.pub user@server
   ```
   
2. Or manually add it to `~/.ssh/authorized_keys` on the server

### Using the Key

```bash
ssh -i deploy_key user@server
```

## Security Notes

- The private key (`deploy_key`) is listed in `.gitignore` to prevent accidental commits
- Keep the private key secure and never share it
- The public key can be safely shared and added to servers/services you want to access
