# Deployment Guide

This guide covers various deployment options for the Order Management System, suitable for both development and production environments.

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Local Development](#local-development)
3. [Heroku Deployment](#heroku-deployment)
4. [Vercel + Supabase](#vercel--supabase)
5. [Railway Deployment](#railway-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Environment Variables](#environment-variables)

---

## Environment Setup

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/Order-Management.git
cd Order-Management

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment
Create `backend/.env` from `backend/env.example`:
```env
PORT=3007
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=inventory_system
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment  
Create `frontend/.env` from `frontend/env.example`:
```env
REACT_APP_API_URL=http://localhost:3007
```

---

## Local Development

### With MySQL
1. Install MySQL locally
2. Create database and tables (see [TECHNICAL_MANUAL.md](TECHNICAL_MANUAL.md))
3. Configure environment variables
4. Start servers:

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start
```

### With Supabase
1. Create Supabase project
2. Run schema setup (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
3. Configure environment variables
4. Start servers (same as above)

---

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Git repository

### Backend Deployment
```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create your-app-name-backend

# Add environment variables
heroku config:set PORT=3007
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set DB_NAME=inventory_system
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Frontend Deployment
```bash
cd frontend

# Create frontend app
heroku create your-app-name-frontend

# Add buildpack for React
heroku buildpacks:set mars/create-react-app

# Set environment variables
heroku config:set REACT_APP_API_URL=https://your-backend-app.herokuapp.com

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

---

## Vercel + Supabase

**Recommended for public projects** - Free tier available for both services.

### Setup Supabase
1. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
2. Note your project URL and keys

### Deploy Backend (Vercel)
1. Create `vercel.json` in backend:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

2. Deploy to Vercel:
```bash
cd backend
npx vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `CORS_ORIGIN`

### Deploy Frontend (Vercel)
```bash
cd frontend
npx vercel --prod
```

Set environment variable in Vercel dashboard:
- `REACT_APP_API_URL=https://your-backend.vercel.app`

---

## Railway Deployment

Railway provides simple deployment with database included.

### Backend
```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Environment Variables
Set in Railway dashboard:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `CORS_ORIGIN`

### Frontend
Same process as backend, deploy separately.

---

## Docker Deployment

### Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3007
CMD ["npm", "start"]
```

### Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
Create `docker-compose.yml` in root:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3007:3007"
    environment:
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=inventory_system
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:3007

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=inventory_system
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### Run with Docker
```bash
docker-compose up -d
```

---

## Environment Variables

### Production Security
**Never commit these to public repositories:**

#### Sensitive Variables
- Database passwords
- API keys
- Service keys
- Private connection strings

#### Public Variables (OK to expose)
- API URLs
- Port numbers
- Non-sensitive configuration

### Environment Variable Management

#### Development
- Use `.env` files (gitignored)
- Copy from `.env.example`

#### Production
- Use hosting platform's environment variable system
- Heroku: `heroku config:set`
- Vercel: Dashboard environment variables
- Railway: Dashboard environment variables

#### Example Production .env
```env
# Safe to share (non-sensitive)
PORT=3007
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Never share (sensitive)
DB_PASSWORD=your_secret_password
SUPABASE_SERVICE_KEY=eyJhbGciOi...
```

---

## SSL/HTTPS Setup

### Development
- Use `http://localhost`
- Modern browsers allow this for development

### Production
- Use HTTPS everywhere
- Most hosting platforms provide free SSL
- Update CORS origins to use `https://`

### Environment Variables for HTTPS
```env
# Development
REACT_APP_API_URL=http://localhost:3007

# Production
REACT_APP_API_URL=https://your-api.herokuapp.com
```

---

## Performance Optimization

### Frontend
- Build optimization: `npm run build`
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies

### Backend
- Database connection pooling (already implemented)
- API response caching
- Optimize database queries
- Use compression middleware

### Database
- Add indexes on frequently queried columns
- Regular maintenance and optimization
- Monitor query performance

---

## Monitoring and Logging

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Application monitoring

### Health Checks
Add health check endpoints:
```javascript
// Backend health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

### Logging
- Use structured logging (JSON format)
- Different log levels (error, warn, info, debug)
- Log rotation for production

---

## Troubleshooting Deployment

### Common Issues

#### CORS Errors
- Verify `CORS_ORIGIN` environment variable
- Check protocol (http vs https)
- Ensure URLs match exactly

#### Database Connection Issues
- Verify database credentials
- Check network connectivity
- Confirm database server is running

#### Environment Variable Issues
- Check variable names (case-sensitive)
- Verify values are set correctly
- Restart application after changes

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check for syntax errors

### Getting Help
- Check hosting platform logs
- Use browser developer tools
- Review application logs
- Test endpoints individually

---

## Security Checklist

### Before Going Public
- [ ] All sensitive data in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] Rate limiting (if needed)

### Regular Maintenance
- [ ] Update dependencies
- [ ] Monitor security advisories
- [ ] Review access logs
- [ ] Backup data regularly
- [ ] Update environment variables if compromised

---

*This deployment guide provides multiple options suitable for different use cases and budgets. Choose the option that best fits your needs.* 