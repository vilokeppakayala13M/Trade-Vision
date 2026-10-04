# Security Policy

## Supported Versions

We currently provide security updates for the latest version of Trade-Vision available on the `main` branch.

| Version | Supported |
| ------- | --------- |
| Latest / main | ✅ |
| Older versions | ❌ |

## Reporting a Vulnerability

If you discover a security vulnerability in Trade-Vision, please report it responsibly.

### How to Report

Please do **not** create a public GitHub issue for security vulnerabilities.

Instead, report the vulnerability through:

- GitHub Security Advisories
- Or contact the project maintainer privately through GitHub

When reporting a vulnerability, please include:

1. A clear description of the vulnerability
2. Steps to reproduce the issue
3. The potential security impact
4. Any relevant screenshots, logs, or proof of concept
5. A suggested fix, if available

### Response Process

We will review valid security reports and investigate the issue.

The expected process is:

1. Acknowledge the report.
2. Investigate and reproduce the vulnerability.
3. Determine its severity and impact.
4. Develop and test a fix.
5. Deploy the fix where applicable.
6. Publish a security advisory when appropriate.

## Security Best Practices

Trade-Vision contributors should:

- Never commit passwords, API keys, tokens, database credentials, or other secrets.
- Store sensitive configuration values in environment variables.
- Never commit `.env` files containing real credentials.
- Keep dependencies updated.
- Use strong authentication and authorization practices.
- Report suspected security issues privately.

## Scope

This policy applies to the Trade-Vision source code, backend services, frontend application, APIs, and related project infrastructure maintained in this repository.
