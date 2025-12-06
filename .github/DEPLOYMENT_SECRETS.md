# Required GitHub Secrets for Deployment

To enable automated deployment, configure these secrets in your GitHub repository:
Settings → Secrets and variables → Actions → New repository secret

## Railway Deployment
- `RAILWAY_TOKEN`: Get from Railway dashboard → Account Settings → Tokens

## Render Deployment
- `RENDER_SERVICE_ID`: Your service ID from Render dashboard
- `RENDER_API_KEY`: API key from Render account settings

## Docker Registry (if using Docker Hub, GHCR, etc.)
- `DOCKER_USERNAME`: Docker registry username
- `DOCKER_PASSWORD`: Docker registry password/token

## Environment Variables (if needed)
Add any required environment variables as secrets:
- `DATABASE_URL`
- `JWT_SECRET`
- `API_KEY`
- etc.

## How to Add Secrets
1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Enter the name and value
5. Click "Add secret"

## Testing the Workflow
After adding secrets:
1. Push to main/master branch
2. Go to Actions tab
3. Watch the workflow run
4. Check deployment status
