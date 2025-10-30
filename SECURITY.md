# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

This application implements several security best practices:

### Input Validation

- **Server-side validation** - All inputs validated using Zod schemas
- **Type safety** - TypeScript prevents type-related vulnerabilities
- **Sanitization** - User inputs are validated before processing

### Authentication & Authorization

- **OAuth 2.0** - Industry-standard authentication with Google
- **Refresh tokens** - Secure token management
- **Environment variables** - Sensitive credentials never in code

### Data Protection

- **HTTPS recommended** - Encrypted data in transit
- **Environment isolation** - Development/production separation
- **Secret management** - `.env` files excluded from version control
- **No client-side secrets** - API credentials only on server

### Error Handling

- **Generic error messages** - Don't expose internal details to users
- **Logging** - Errors logged server-side for debugging
- **Graceful degradation** - Failed notifications don't crash submissions

### API Security

- **CORS configuration** - Controlled cross-origin requests
- **Content-Type validation** - Prevents content injection
- **Rate limiting ready** - Architecture supports rate limiting middleware

## Rate Limiting (Recommended for Production)

While not included by default, we recommend implementing rate limiting for production deployments:

```javascript
// Example: Using express-rate-limit
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', apiLimiter);
```

## Security Headers (Recommended for Production)

Consider adding security headers using `helmet`:

```javascript
import helmet from 'helmet';
app.use(helmet());
```

## Environment Variable Security

### Development
- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets regularly

### Production
- Use platform-specific secret management
- Enable HTTPS/TLS
- Restrict access to production credentials
- Use different credentials than development

## Reporting a Vulnerability

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email details to: info@lifesavertech.ca
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Initial response** within 48 hours
- **Assessment** within 7 days
- **Fix timeline** depends on severity
- **Credit** in CHANGELOG if desired

## Best Practices for Deployment

### Google OAuth Setup
- Use separate OAuth credentials for development and production
- Restrict authorized domains to your production domain
- Enable only required API scopes
- Regularly rotate refresh tokens

### Slack Webhooks
- One webhook per environment (dev/staging/prod)
- Restrict webhook to specific channels
- Monitor webhook usage
- Regenerate webhooks if compromised

### Database (Google Sheets)
- Use separate spreadsheets for dev/staging/prod
- Restrict sharing to only necessary accounts
- Regularly review access permissions
- Consider data retention policies

## Security Checklist for Production

- [ ] HTTPS/TLS enabled
- [ ] Environment variables properly secured
- [ ] Different credentials for prod vs dev
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Error messages sanitized
- [ ] Logging configured (no sensitive data in logs)
- [ ] Dependencies regularly updated
- [ ] Security patches applied promptly
- [ ] Backup strategy in place
- [ ] Monitoring/alerting configured

## Dependencies

Keep dependencies up to date to receive security patches:

```bash
npm audit              # Check for vulnerabilities
npm audit fix          # Auto-fix vulnerabilities
npm update            # Update to latest compatible versions
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Google OAuth2 Security](https://developers.google.com/identity/protocols/oauth2/web-server#security-considerations)

---

**Last Updated:** October 2025  
**Maintained by:** Lindsey Stead
